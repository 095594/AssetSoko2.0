<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auction;
    public $won;

    public function __construct($auction, $won)
    {
        $this->auction = $auction;
        $this->won = $won;
    }

    public function broadcastOn()
    {
        return new Channel('user.' . $this->auction->user_id);
    }

    public function broadcastAs()
    {
        return 'AuctionEnded';
    }
}