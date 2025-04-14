<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Asset;
use App\Models\User;
use App\Models\Bid;
use App\Services\AuctionService;
use App\Events\AuctionEndedBroadcast;
use App\Notifications\WinningBidderNotification;
use App\Notifications\AuctionEndedNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AuctionServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuctionService $auctionService;
    private User $seller;
    private User $winner;
    private User $outbidUser;
    private Asset $asset;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->seller = User::factory()->create();
        $this->winner = User::factory()->create();
        $this->outbidUser = User::factory()->create();

        // Create an asset with ended auction
        $this->asset = Asset::factory()->create([
            'user_id' => $this->seller->id,
            'status' => 'active',
            'auction_end_time' => Carbon::now()->subHour(), // Auction ended 1 hour ago
        ]);

        // Create bids
        Bid::factory()->create([
            'asset_id' => $this->asset->id,
            'user_id' => $this->winner->id,
            'amount' => 1000,
        ]);

        Bid::factory()->create([
            'asset_id' => $this->asset->id,
            'user_id' => $this->outbidUser->id,
            'amount' => 900,
        ]);

        $this->auctionService = app(AuctionService::class);

        // Fake notifications and events
        Notification::fake();
        Event::fake();
    }

    public function test_process_ended_auctions()
    {
        // Process ended auctions
        $this->auctionService->processEndedAuctions();

        // Assert asset status was updated
        $this->asset->refresh();
        $this->assertEquals('ended', $this->asset->status);

        // Assert payment record was created
        $this->assertDatabaseHas('payments', [
            'asset_id' => $this->asset->id,
            'buyer_id' => $this->winner->id,
            'seller_id' => $this->seller->id,
            'amount' => 1000,
            'status' => 'pending',
        ]);

        // Assert notifications were sent
        Notification::assertSentTo(
            $this->winner,
            WinningBidderNotification::class,
            function ($notification) {
                return $notification->asset->id === $this->asset->id;
            }
        );

        Notification::assertSentTo(
            $this->seller,
            AuctionEndedNotification::class,
            function ($notification) {
                return $notification->asset->id === $this->asset->id;
            }
        );

        Notification::assertSentTo(
            $this->outbidUser,
            AuctionEndedNotification::class,
            function ($notification) {
                return $notification->asset->id === $this->asset->id;
            }
        );

        // Assert events were broadcast
        Event::assertDispatched(AuctionEndedBroadcast::class, function ($event) {
            return $event->asset->id === $this->asset->id &&
                   $event->type === 'winner' &&
                   $event->userId === $this->winner->id;
        });

        Event::assertDispatched(AuctionEndedBroadcast::class, function ($event) {
            return $event->asset->id === $this->asset->id &&
                   $event->type === 'seller' &&
                   $event->userId === $this->seller->id;
        });

        Event::assertDispatched(AuctionEndedBroadcast::class, function ($event) {
            return $event->asset->id === $this->asset->id &&
                   $event->type === 'outbid' &&
                   $event->userId === $this->outbidUser->id;
        });
    }
}
