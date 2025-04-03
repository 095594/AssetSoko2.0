<?php

namespace App\Console\Commands;

use App\Events\AuctionCompleted;
use App\Models\Asset;
use App\Models\Bid;
use App\Notifications\AuctionWonNotification;
use Illuminate\Console\Command;

class CheckAuctionCompletion extends Command
{
    protected $signature = 'auctions:check-completion';
    protected $description = 'Check for completed auctions and notify winners';

    public function handle()
    {
        $now = now();
        
        // Get assets whose auction period has just ended
        $completedAssets = Asset::where('auction_end_time', '<=', $now)
            ->where('status', 'active')
            ->get();

        foreach ($completedAssets as $asset) {
            // Get the highest bid
            $highestBid = Bid::where('asset_id', $asset->id)
                ->orderBy('amount', 'desc')
                ->first();

            if ($highestBid && $highestBid->amount >= $asset->reserve_price) {
                // Update asset status
                $asset->update(['status' => 'completed']);

                // Get the winning user
                $winner = $highestBid->user;

                // Send notification
                $winner->notify(new AuctionWonNotification($asset, $highestBid->amount));

                // Broadcast event for real-time notification
                event(new AuctionCompleted($asset, $winner, $highestBid->amount));
            } else {
                // If no valid bids, mark as unsold
                $asset->update(['status' => 'unsold']);
            }
        }

        $this->info('Auction completion check completed successfully.');
    }
} 