<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Events\AuctionEndedBroadcast;
use App\Notifications\AuctionCompletedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckAuctionCompletion extends Command
{
    protected $signature = 'auctions:check-completion';
    protected $description = 'Check for completed auctions and process them';

    public function handle()
    {
        \Log::info('Starting auction completion check at: ' . now());
        
        // Get all assets where auction has ended but status is not completed
        $completedAssets = Asset::where('auction_end_time', '<=', now())
            ->where('status', '!=', 'completed')
            ->get();

        \Log::info('Found ' . $completedAssets->count() . ' completed auctions to process');

        foreach ($completedAssets as $asset) {
            try {
                \Log::info('Processing auction completion for asset: ' . $asset->id);
                
                // Get the winning bid (highest bid)
                $winningBid = Bid::where('asset_id', $asset->id)
                    ->orderBy('amount', 'desc')
                    ->first();

                if ($winningBid) {
                    // Update all bids for this asset
                    Bid::where('asset_id', $asset->id)
                        ->update(['status' => 'outbid']);
                    
                    // Update winning bid status
                    $winningBid->update(['status' => 'won']);

                    // Create payment record
                    $payment = Payment::create([
                        'user_id' => $winningBid->user_id,
                        'buyer_id' => $winningBid->user_id,
                        'seller_id' => $asset->user_id,
                        'asset_id' => $asset->id,
                        'bid_id' => $winningBid->id,
                        'amount' => $winningBid->amount,
                        'status' => 'pending',
                        'due_date' => now()->addDays(1),
                    ]);

                    // Update asset status
                    $asset->update([
                        'status' => 'completed',
                        'winner_id' => $winningBid->user_id,
                        'final_price' => $winningBid->amount,
                    ]);

                    // Broadcast to winner
                    broadcast(new AuctionEndedBroadcast(
                        $asset,
                        $winningBid,
                        'winner',
                        $winningBid->user_id
                    ));

                    // Broadcast to other bidders
                    $otherBidders = Bid::where('asset_id', $asset->id)
                        ->where('user_id', '!=', $winningBid->user_id)
                        ->distinct()
                        ->pluck('user_id');

                    foreach ($otherBidders as $bidderId) {
                        broadcast(new AuctionEndedBroadcast(
                            $asset,
                            null,
                            'outbid',
                            $bidderId
                        ));
                    }

                    // Broadcast to seller
                    broadcast(new AuctionEndedBroadcast(
                        $asset,
                        $winningBid,
                        'seller',
                        $asset->user_id
                    ));

                    // Send notifications
                    $winningBid->user->notify(new \App\Notifications\WinningBidderNotification($asset, $winningBid));
                    $asset->user->notify(new \App\Notifications\AuctionEndedNotification($asset, $winningBid));

                    \Log::info("Successfully processed completed auction for asset: {$asset->name}");
                } else {
                    // No bids were placed
                    $asset->update(['status' => 'completed']);
                    
                    // Notify seller that no bids were placed
                    broadcast(new AuctionEndedBroadcast(
                        $asset,
                        null,
                        'seller',
                        $asset->user_id
                    ));
                    
                    \Log::info("No winning bid found for asset: {$asset->name}");
                }
            } catch (\Exception $e) {
                \Log::error("Error processing auction completion for asset {$asset->id}: " . $e->getMessage());
                $this->error("Failed to process auction for asset: {$asset->name}");
            }
        }

        \Log::info('Finished checking auction completion at: ' . now());
    }
}