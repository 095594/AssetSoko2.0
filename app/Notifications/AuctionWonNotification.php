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
        return (new MailMessage)
            ->subject('Congratulations! You won the auction')
            ->line('Congratulations! You have won the auction for ' . $this->asset->name)
            ->line('Your winning bid: $' . number_format($this->winningBid->amount, 2))
            ->action('View Asset', route('assets.show', $this->asset))
            ->line('Please proceed with the payment to complete your purchase.');
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