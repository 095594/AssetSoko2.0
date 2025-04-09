<?php

namespace App\Listeners;

use App\Events\BidPlaced;
use App\Notifications\NewBidNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleBidPlaced implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(BidPlaced $event)
    {
        $bid = $event->bid;
        $asset = $bid->asset;
        
        // Notify the asset owner
        $asset->user->notify(new NewBidNotification($asset, $bid));
        
        // Notify other bidders
        $otherBidders = $asset->bids()
            ->where('user_id', '!=', $bid->user_id)
            ->where('user_id', '!=', $asset->user_id)
            ->with('user')
            ->get()
            ->pluck('user')
            ->unique();

        foreach ($otherBidders as $bidder) {
            $bidder->notify(new NewBidNotification($asset, $bid));
        }
    }
} 