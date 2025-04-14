<?php

namespace App\Notifications;

use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuctionWonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;
    protected $winningBid;

    /**
     * Create a new notification instance.
     */
    public function __construct(Asset $asset, Bid $winningBid)
    {
        $this->asset = $asset;
        $this->winningBid = $winningBid;
        $this->onQueue('notifications');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $this->winningBid->payment_url = url("/payments/{$this->asset->id}");
        
        return (new MailMessage)
            ->subject('Congratulations! You Won the Auction: ' . $this->asset->name)
            ->markdown('emails.auction-won', [
                'user' => $notifiable,
                'asset' => $this->asset,
                'winningBid' => $this->winningBid
            ]);
    }

    public function toArray($notifiable)
    {
        return [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'winning_bid_amount' => $this->winningBid->amount,
            'message' => 'Congratulations! You have won the auction for ' . $this->asset->name,
            'type' => 'auction_won'
        ];
    }
}