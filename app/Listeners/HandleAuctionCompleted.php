<?php

namespace App\Listeners;

use App\Events\AuctionCompleted;
use App\Notifications\AuctionWonNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleAuctionCompleted implements ShouldQueue
{
    use InteractsWithQueue;

    public $queue = 'notifications';

    public function handle(AuctionCompleted $event)
    {
        $asset = $event->asset;
        $winner = $event->winner;
        $winningBid = $asset->bids()->where('user_id', $winner->id)->latest()->first();

        // Notify the winner
        $winner->notify(new AuctionWonNotification($asset, $winningBid));

        // Notify the seller
        $asset->user->notify(new \App\Notifications\AuctionEndedNotification($asset, $winner, $winningBid));
    }
} 