<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Payment;
use App\Notifications\WinningBidderNotification;
use App\Notifications\AuctionEndedNotification;
use Illuminate\Support\Facades\Log;

class TestAuctionProcessing extends Command
{
    protected $signature = 'auctions:test-processing';
    protected $description = 'Test the auction processing functionality';

    public function handle()
    {
        $this->info('Starting auction processing test...');

        try {
            // Find an auction that should be ended
            $auction = Auction::where('end_time', '<=', now())
                ->where('status', 'active')
                ->first();

            if (!$auction) {
                $this->warn('No ended auctions found to process.');
                return;
            }

            $this->info("Processing auction ID: {$auction->id}");

            // Get winning bid
            $winningBid = $auction->bids()->orderBy('amount', 'desc')->first();

            if ($winningBid) {
                $this->info("Found winning bid: {$winningBid->amount}");

                // Create payment record
                $payment = Payment::create([
                    'auction_id' => $auction->id,
                    'user_id' => $winningBid->user_id,
                    'amount' => $winningBid->amount,
                    'status' => 'pending'
                ]);

                $this->info("Created payment record ID: {$payment->id}");

                // Send notifications
                $winningBid->user->notify(new WinningBidderNotification($auction, $winningBid));
                $auction->user->notify(new AuctionEndedNotification($auction, $winningBid));

                $this->info('Notifications sent successfully');
            } else {
                $this->warn('No winning bid found for this auction');
            }

            // Update auction status
            $auction->update(['status' => 'ended']);
            $this->info('Auction status updated to ended');

            $this->info('Test completed successfully!');
        } catch (\Exception $e) {
            $this->error("Error during test: {$e->getMessage()}");
            Log::error('Auction processing test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 