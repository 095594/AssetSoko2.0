<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\Bid;
use App\Notifications\WinningBidderNotification;
use App\Notifications\AuctionEndedNotification;

class MonitorAuctions extends Command
{
    protected $signature = 'auctions:monitor';
    protected $description = 'Monitor auctions and log their status every second';

    public function handle()
    {
        $this->info('Starting auction monitor...');
        Log::info('Auction monitor started at: ' . now());

        while (true) {
            try {
                $now = Carbon::now();
                
                // Get all active auctions
                $activeAuctions = Asset::where('status', 'active')->get();
                
                if ($activeAuctions->count() > 0) {
                    Log::info('Active auctions found:', [
                        'count' => $activeAuctions->count(),
                        'current_time' => $now->toDateTimeString()
                    ]);

                    foreach ($activeAuctions as $auction) {
                        $timeLeft = $now->diffInSeconds($auction->auction_end_time, false);
                        
                        Log::info('Checking auction:', [
                            'auction_id' => $auction->id,
                            'name' => $auction->name,
                            'end_time' => $auction->auction_end_time->toDateTimeString(),
                            'time_left_seconds' => $timeLeft,
                            'status' => $auction->status,
                            'current_time' => $now->toDateTimeString()
                        ]);

                        // If auction has ended
                        if ($timeLeft <= 0) {
                            Log::info('Auction ending now:', [
                                'auction_id' => $auction->id,
                                'name' => $auction->name
                            ]);

                            // Get winning bid
                            $winningBid = $auction->bids()
                                ->orderBy('amount', 'desc')
                                ->first();

                            if ($winningBid) {
                                Log::info('Winning bid found:', [
                                    'bid_id' => $winningBid->id,
                                    'amount' => $winningBid->amount,
                                    'bidder_id' => $winningBid->user_id
                                ]);

                                // Update auction status
                                $auction->status = 'ended';
                                $auction->save();

                                // Notify winner
                                $winningBid->user->notify(new WinningBidderNotification($auction, $winningBid));
                                Log::info('Winner notified');

                                // Notify seller
                                $auction->user->notify(new AuctionEndedNotification($auction, $winningBid));
                                Log::info('Seller notified');
                            } else {
                                Log::info('No bids found for ended auction', [
                                    'auction_id' => $auction->id
                                ]);

                                $auction->status = 'ended';
                                $auction->save();

                                // Notify seller of no bids
                                $auction->user->notify(new AuctionEndedNotification($auction, null));
                                Log::info('Seller notified of no bids');
                            }
                        }
                    }
                }

                // Clear log file if it gets too large (over 5MB)
                $logFile = storage_path('logs/laravel.log');
                if (file_exists($logFile) && filesize($logFile) > 5 * 1024 * 1024) {
                    file_put_contents($logFile, '');
                    Log::info('Log file cleared due to size');
                }

                sleep(1);
            } catch (\Exception $e) {
                Log::error('Error in auction monitor: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                sleep(1);
            }
        }
    }
}
