<?php

namespace App\Events;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionCompleted implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $queue = 'notifications';

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
    public function broadcastOn()
    {
        return [
            new PrivateChannel('user.' . $this->winner->id),
            new PrivateChannel('user.' . $this->asset->user_id),
        ];
    }

    public function broadcastAs()
    {
        return 'AuctionCompleted';
    }

    public function broadcastWith()
    {
        $winningBid = $this->asset->bids()->where('user_id', $this->winner->id)->latest()->first();
        
        return [
            'asset' => [
                'id' => $this->asset->id,
                'name' => $this->asset->name,
                'image' => $this->asset->images->first()?->url,
            ],
            'winner' => [
                'id' => $this->winner->id,
                'name' => $this->winner->name,
            ],
            'winning_bid' => [
                'amount' => $winningBid->amount,
                'created_at' => $winningBid->created_at,
            ],
            'show_popup' => true,
            'popup_title' => 'Auction Won!',
            'popup_message' => 'Congratulations! You have won the auction for ' . $this->asset->name,
            'popup_details' => [
                'winning_bid' => number_format($winningBid->amount, 2),
                'payment_due' => 'Payment is due within 24 hours',
            ],
        ];
    }
} 