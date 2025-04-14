<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Asset;
use Carbon\Carbon;

class CheckAuctionStatus implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $asset;
    public $currentTime;
    public $hasEnded;

    public function __construct(Asset $asset)
    {
        $this->asset = $asset;
        $this->currentTime = Carbon::now();
        $this->hasEnded = $this->currentTime->gte($asset->auction_end_time);
    }

    public function broadcastOn()
    {
        return [
            new Channel('auction.' . $this->asset->id),
            new Channel('auctions')
        ];
    }

    public function broadcastAs()
    {
        return 'auction.status';
    }

    public function broadcastWith()
    {
        return [
            'asset_id' => $this->asset->id,
            'current_time' => $this->currentTime->toIso8601String(),
            'end_time' => $this->asset->auction_end_time->toIso8601String(),
            'has_ended' => $this->hasEnded,
            'status' => $this->asset->status,
            'highest_bid' => $this->asset->bids()->max('amount') ?? 0
        ];
    }
}
