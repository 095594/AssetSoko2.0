<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Asset;

class WatchlistUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $assetId;
    public $isWatching;
    public $asset;

    public function __construct($userId, $assetId, $isWatching)
    {
        $this->userId = $userId;
        $this->assetId = $assetId;
        $this->isWatching = $isWatching;
        $this->asset = Asset::with(['seller', 'bids'])->find($assetId);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->userId);
    }
} 