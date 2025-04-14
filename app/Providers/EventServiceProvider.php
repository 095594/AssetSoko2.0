<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\BidPlaced;
use App\Events\WatchlistUpdated;
use App\Events\AuctionCompleted;
use App\Events\AuctionEndedBroadcast;
use App\Listeners\HandleBidPlaced;
use App\Listeners\HandleWatchlistUpdated;
use App\Listeners\HandleAuctionCompleted;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        BidPlaced::class => [
            HandleBidPlaced::class,
        ],
        WatchlistUpdated::class => [
            HandleWatchlistUpdated::class,
        ],
        AuctionCompleted::class => [
            HandleAuctionCompleted::class,
        ],
        AuctionEndedBroadcast::class => [],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}