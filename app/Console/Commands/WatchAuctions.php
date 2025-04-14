<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Carbon\Carbon;
use App\Events\AuctionEndedBroadcast;
use App\Notifications\AuctionEndedNotification;
use App\Notifications\AuctionWonNotification;
use App\Notifications\AuctionOutbidNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;

class WatchAuctions extends Command
{
    protected $signature = 'auctions:watch';
    protected $description = 'Watch for completed auctions in real-time';

    public function handle()
    {
        $this->info('Starting auction watcher...');

        while (true) {
            try {
                DB::beginTransaction();

                $completedAssets = Asset::with(['bids' => function($query) {
                    $query->orderByDesc('amount');
                }, 'user', 'bids.user'])  
                ->where('auction_end_time', '<=', now())
                ->where('status', '!=', 'completed')
                ->lockForUpdate()
                ->get();

                foreach ($completedAssets as $asset) {
                    $this->info("Processing auction completion for asset: {$asset->id}");
                    
                    try {
                        // Get the winning bid
                        $winningBid = $asset->bids->first();

                        // Update asset status first
                        $asset->status = 'completed';
                        $asset->save();

                        // Refresh the asset to ensure we have the latest data
                        $asset->refresh();

                        if ($winningBid) {
                            // Convert winning bid to array format
                            $bidData = [
                                'amount' => floatval($winningBid->amount),
                                'payment_url' => url("/payments/{$asset->id}")
                            ];

                            Log::info("Processing winner notification for asset {$asset->id}, winner user {$winningBid->user_id}");

                            // Notify winner
                            try {
                                event(new AuctionEndedBroadcast(
                                    'winner',
                                    $asset,
                                    $winningBid->user_id,
                                    $bidData
                                ));
                                
                                $winningBid->user->notify(new AuctionWonNotification($asset, $winningBid));
                                Log::info("Winner notification sent successfully");
                            } catch (\Exception $e) {
                                Log::error("Error sending winner notification: " . $e->getMessage());
                            }

                            Log::info("Processing seller notification for asset {$asset->id}, seller user {$asset->user_id}");

                            // Notify seller
                            try {
                                event(new AuctionEndedBroadcast(
                                    'seller',
                                    $asset,
                                    $asset->user_id,
                                    $bidData
                                ));
                                
                                $asset->user->notify(new AuctionEndedNotification($asset, $winningBid));
                                Log::info("Seller notification sent successfully");
                            } catch (\Exception $e) {
                                Log::error("Error sending seller notification: " . $e->getMessage());
                            }

                            // Notify other bidders
                            $otherBidders = $asset->bids
                                ->where('user_id', '!=', $winningBid->user_id)
                                ->pluck('user_id')
                                ->unique();

                            Log::info("Processing notifications for {$otherBidders->count()} other bidders");

                            foreach ($otherBidders as $bidderId) {
                                try {
                                    event(new AuctionEndedBroadcast(
                                        'outbid',
                                        $asset,
                                        $bidderId,
                                        $bidData
                                    ));
                                } catch (\Exception $e) {
                                    Log::error("Error broadcasting to bidder {$bidderId}: " . $e->getMessage());
                                }
                            }
                            
                            // Send email notifications to other bidders
                            try {
                                $otherBidderUsers = \App\Models\User::whereIn('id', $otherBidders)->get();
                                Notification::send($otherBidderUsers, new AuctionOutbidNotification($asset, $winningBid));
                                Log::info("Email notifications sent to other bidders successfully");
                            } catch (\Exception $e) {
                                Log::error("Error sending email notifications to other bidders: " . $e->getMessage());
                            }

                        } else {
                            Log::info("No winning bid for asset {$asset->id}, notifying seller only");

                            // No bids, just notify the seller
                            try {
                                event(new AuctionEndedBroadcast(
                                    'seller',
                                    $asset,
                                    $asset->user_id,
                                    null
                                ));
                                
                                $asset->user->notify(new AuctionEndedNotification($asset, null));
                                Log::info("Seller notification for no bids sent successfully");
                            } catch (\Exception $e) {
                                Log::error("Error sending seller notification for no bids: " . $e->getMessage());
                            }
                        }

                        $this->info("Successfully processed auction completion for asset: {$asset->name}");
                    } catch (\Exception $e) {
                        Log::error("Error processing asset {$asset->id}: " . $e->getMessage());
                        continue;
                    }
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollback();
                Log::error("Error in auction watcher: " . $e->getMessage());
                $this->error("Error: " . $e->getMessage());
            }

            sleep(10); // Check every 10 seconds
        }
    }
}
