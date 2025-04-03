<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Bid;

class BidPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $bid;

    public function __construct(Bid $bid)
    {
        $this->bid = $bid;
    }

    public function broadcastOn()
    {
        return new Channel('bids');
    }

    public function broadcastAs()
    {
        return 'bid.placed';
    }

    public function broadcastWith()
    {
        return [
            'bid' => [
                'id' => $this->bid->id,
                'amount' => $this->bid->amount,
                'user_id' => $this->bid->user_id,
                'asset_id' => $this->bid->asset_id,
                'created_at' => $this->bid->created_at,
            ],
            'message' => 'A new bid has been placed on the asset.',
        ];
    }
}