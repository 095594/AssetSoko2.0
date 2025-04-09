<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Asset;
use App\Models\Bid;

class AuctionCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
            ->subject('Congratulations! You won the auction for ' . $this->asset->name)
            ->line('You have won the auction for ' . $this->asset->name)
            ->line('Winning Amount: KES ' . number_format($this->winningBid->amount, 2))
            ->action('Complete Payment', route('payments.create', ['asset' => $this->asset->id]))
            ->line('Please complete your payment within 24 hours to secure your purchase.');
    }

    public function toArray($notifiable)
    {
        return [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'winning_amount' => $this->winningBid->amount,
            'payment_url' => route('payments.create', ['asset' => $this->asset->id]),
        ];
    }
} 