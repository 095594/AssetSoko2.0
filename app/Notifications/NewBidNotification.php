<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Asset;
use App\Models\Bid;

class NewBidNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;
    protected $bid;

    public function __construct(Asset $asset, Bid $bid)
    {
        $this->asset = $asset;
        $this->bid = $bid;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $isSeller = $notifiable->id === $this->asset->user_id;
        $message = $isSeller 
            ? "A new bid of Ksh {$this->bid->amount} has been placed on your asset {$this->asset->name}"
            : "Your bid of Ksh {$this->bid->amount} has been placed successfully on {$this->asset->name}";

        return (new MailMessage)
            ->subject($isSeller ? 'New Bid on Your Asset' : 'Bid Placed Successfully')
            ->line($message)
            ->line("Current highest bid: Ksh {$this->bid->amount}")
            ->action('View Asset', url("/buyer/assets/{$this->asset->id}"))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable): array
    {
        return [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'bid_amount' => $this->bid->amount,
            'bidder_name' => $this->bid->user->name,
            'is_seller' => $notifiable->id === $this->asset->user_id,
        ];
    }
} 