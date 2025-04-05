<?php

namespace App\Events;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $asset;
    public $winner;
    public $winningBid;

    /**
     * Create a new event instance.
     */
    public function __construct(Asset $asset, User $winner, $winningBid)
    {
        $this->asset = $asset;
        $this->winner = $winner;
        $this->winningBid = $winningBid;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->winner->id),
        ];
    }

    public function broadcastAs()
    {
        return 'AuctionCompleted';
    }

    public function broadcastWith()
    {
        return [
            'asset' => [
                'id' => $this->asset->id,
                'name' => $this->asset->name,
                'price' => $this->winningBid,
            ],
            'message' => 'Congratulations! You have won the auction for ' . $this->asset->name . ' with a bid of Ksh ' . number_format($this->winningBid, 2) . '. Please proceed to payment.',
        ];
    }
} 