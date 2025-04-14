<?php

namespace App\Events;

use App\Models\Asset;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AuctionEndedBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    private $type;
    private $userId;
    private $asset;
    private $winningBid;

    /**
     * Create a new event instance.
     */
    public function __construct(string $type, Asset $asset, int $userId, ?array $winningBid = null)
    {
        $this->type = $type;
        $this->userId = $userId;
        $this->asset = $asset;
        $this->winningBid = $winningBid;

        Log::info("AuctionEndedBroadcast constructed", [
            'type' => $type,
            'userId' => $userId,
            'asset' => [
                'id' => $asset->id,
                'name' => $asset->name,
                'image' => $asset->image
            ],
            'winningBid' => $winningBid
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        Log::info("Broadcasting to channel", [
            'channel' => "private-user.{$this->userId}",
            'type' => $this->type
        ]);
        
        return [
            new PrivateChannel("private-user.{$this->userId}")
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        if (!$this->asset) {
            Log::error("Asset is null in AuctionEndedBroadcast", [
                'type' => $this->type,
                'userId' => $this->userId
            ]);
            return [
                'type' => $this->type,
                'error' => 'Asset not found',
            ];
        }

        $data = [
            'type' => $this->type,
            'asset' => [
                'id' => $this->asset->id,
                'name' => $this->asset->name,
                'image' => $this->asset->image
            ],
            'winningBid' => $this->winningBid
        ];

        Log::info("Broadcasting data", [
            'channel' => "private-user.{$this->userId}",
            'data' => $data
        ]);

        return $data;
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'AuctionEndedBroadcast';
    }
}
