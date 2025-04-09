<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Support\Facades\Log;

class AuctionEndedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $queue = 'notifications';

    protected $asset;
    protected $winningBid;

    public function __construct(Asset $asset, Bid $winningBid)
    {
        $this->asset = $asset;
        $this->winningBid = $winningBid;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Auction Has Ended')
            ->line("Your auction for {$this->asset->name} has ended.")
            ->line("Winning Bid: KES " . number_format($this->winningBid->amount, 2))
            ->line("Winning Bidder: {$this->winningBid->user->name}")
            ->action('View Asset', route('assets.show', $this->asset->id))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        Log::info('Preparing AuctionEndedNotification database record', [
            'user_id' => $notifiable->id,
            'asset_id' => $this->asset->id,
            'bid_id' => $this->winningBid->id
        ]);

        $data = [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'winning_bid' => $this->winningBid->amount,
            'message' => "The auction for {$this->asset->name} has ended. The winning bid was KES " . number_format($this->winningBid->amount, 2) . ".",
            'type' => 'auction_ended'
        ];

        Log::info('AuctionEndedNotification data prepared', [
            'notification_data' => $data
        ]);

        return $data;
    }
} 