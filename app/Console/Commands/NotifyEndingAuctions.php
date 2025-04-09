<?php

namespace App\Console\Commands;

use App\Models\Auction;
use App\Notifications\AuctionEndingSoon;
use Illuminate\Console\Command;
use Carbon\Carbon;

class NotifyEndingAuctions extends Command
{
    protected $signature = 'auctions:notify-ending';
    protected $description = 'Send notifications for auctions ending soon';

    public function handle()
    {
        $this->info('Checking for auctions ending soon...');

        // Get auctions ending in the next 5 minutes
        $endingAuctions = Auction::where('status', 'active')
            ->where('end_time', '<=', Carbon::now()->addMinutes(5))
            ->where('end_time', '>', Carbon::now())
            ->get();

        foreach ($endingAuctions as $auction) {
            // Notify the seller
            $auction->asset->user->notify(new AuctionEndingSoon($auction, 'seller'));

            // Notify all bidders
            foreach ($auction->bids as $bid) {
                $bid->user->notify(new AuctionEndingSoon($auction, 'bidder'));
            }

            $this->info("Sent notifications for auction #{$auction->id}");
        }

        $this->info('Finished checking for ending auctions.');
    }
} 