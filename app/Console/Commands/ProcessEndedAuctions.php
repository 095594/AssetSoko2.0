<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use Illuminate\Console\Command;

class ProcessEndedAuctions extends Command
{
    protected $signature = 'auctions:process-ended';
    protected $description = 'Process ended auctions and initiate payments for winning bids';

    public function handle()
    {
        $this->info('Processing ended auctions...');

        // Find assets with ended auctions
        $endedAssets = Asset::where('status', 'active')
            ->where('auction_end_time', '<=', now())
            ->get();

        foreach ($endedAssets as $asset) {
            // Find the winning bid
            $winningBid = $asset->bids()
                ->where('status', 'pending')
                ->latest()
                ->first();

            if ($winningBid) {
                // Mark the bid as accepted
                $winningBid->update(['status' => 'accepted']);

                // Create payment record
                Payment::create([
                    'asset_id' => $asset->id,
                    'bid_id' => $winningBid->id,
                    'buyer_id' => $winningBid->user_id,
                    'seller_id' => $asset->user_id,
                    'amount' => $winningBid->amount,
                    'payment_method' => 'pending', // Will be set when buyer initiates payment
                    'status' => 'pending'
                ]);

                // Update asset status
                $asset->update(['status' => 'pending_payment']);

                $this->info("Processed asset {$asset->id}: Created payment record for bid {$winningBid->id}");
            } else {
                // No winning bid, mark asset as unsold
                $asset->update(['status' => 'unsold']);
                $this->info("Processed asset {$asset->id}: No winning bid found, marked as unsold");
            }
        }

        $this->info('Finished processing ended auctions.');
    }
} 