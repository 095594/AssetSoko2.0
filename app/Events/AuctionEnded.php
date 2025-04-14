<?php

namespace App\Events;

use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $asset;
    public $winningBid;

    /**
     * Create a new event instance.
     */
    public function __construct(Asset $asset, ?Bid $winningBid = null)
    {
        $this->asset = $asset;
        $this->winningBid = $winningBid;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        $channels = [
            new Channel('auctions'),
            new PrivateChannel('asset.' . $this->asset->id)
        ];

        if ($this->winningBid) {
            $channels[] = new PrivateChannel('user.' . $this->winningBid->user_id);
            $channels[] = new PrivateChannel('user.' . $this->asset->user_id);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith()
    {
        return [
            'asset' => [
                'id' => $this->asset->id,
                'name' => $this->asset->name,
                'current_price' => $this->asset->current_price,
                'status' => $this->asset->status,
            ],
            'winning_bid' => $this->winningBid ? [
                'id' => $this->winningBid->id,
                'user_id' => $this->winningBid->user_id,
                'amount' => $this->winningBid->amount,
            ] : null,
            'message' => $this->winningBid 
                ? 'Auction ended with a winning bid of ' . $this->winningBid->amount
                : 'Auction ended with no winning bids',
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    public function broadcastAs()
    {
        return 'AuctionEnded';
    }
}