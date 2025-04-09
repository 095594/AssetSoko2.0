<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Events\AuctionCompleted;
use App\Notifications\AuctionEndedNotification;
use App\Notifications\WinningBidderNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class EndAuctions extends Command
{
    protected $signature = 'auctions:end {asset_id}';
    protected $description = 'End a specific auction for testing purposes';

    public function handle()
    {
        $assetId = $this->argument('asset_id');
        $asset = Asset::findOrFail($assetId);

        Log::info('Starting auction end process', [
            'asset_id' => $asset->id,
            'asset_name' => $asset->name
        ]);

        // Update the asset's end time to now
        $asset->update([
            'auction_end_time' => Carbon::now(),
            'status' => 'inactive'
        ]);

        Log::info('Asset status updated', [
            'asset_id' => $asset->id,
            'new_status' => 'inactive'
        ]);

        // Find the winning bid
        $winningBid = Bid::where('asset_id', $asset->id)
            ->orderBy('amount', 'desc')
            ->first();

        if ($winningBid) {
            Log::info('Found winning bid', [
                'bid_id' => $winningBid->id,
                'amount' => $winningBid->amount,
                'bidder_id' => $winningBid->user_id
            ]);

            // Update bid status
            $winningBid->update(['status' => 'won']);

            // Create a payment record
            $payment = Payment::create([
                'asset_id' => $asset->id,
                'bid_id' => $winningBid->id,
                'buyer_id' => $winningBid->user_id,
                'seller_id' => $asset->user_id,
                'amount' => $winningBid->amount,
                'status' => 'pending',
                'payment_method' => 'pending',
                'payment_details' => json_encode([
                    'auction_end_time' => Carbon::now(),
                    'winning_bid_id' => $winningBid->id
                ])
            ]);

            Log::info('Payment record created', [
                'payment_id' => $payment->id,
                'amount' => $payment->amount
            ]);

            try {
                // Dispatch the AuctionCompleted event
                event(new AuctionCompleted($asset, $winningBid->user, $winningBid));

                Log::info('Auction completed event dispatched', [
                    'asset_id' => $asset->id,
                    'winner_id' => $winningBid->user_id
                ]);

                // Notify the winning bidder
                $winningBid->user->notify(new WinningBidderNotification($asset, $winningBid));
                
                // Notify the seller
                $asset->user->notify(new AuctionEndedNotification($asset, $winningBid));

                Log::info('Notifications dispatched', [
                    'winner_id' => $winningBid->user_id,
                    'seller_id' => $asset->user_id
                ]);
            } catch (\Exception $e) {
                Log::error('Error dispatching notifications', [
                    'error' => $e->getMessage(),
                    'asset_id' => $asset->id
                ]);
            }

            $this->info("Auction for asset {$asset->name} has been ended.");
            $this->info("Winning bid: {$winningBid->amount}");
            $this->info("Payment record created with ID: {$payment->id}");
            $this->info("Winning bidder can now make payment at: " . route('buyer.payments.initiate', $asset->id));
        } else {
            Log::info('No winning bid found for asset', [
                'asset_id' => $asset->id
            ]);
            $this->info("Auction for asset {$asset->name} has been ended with no bids.");
        }
    }
} 