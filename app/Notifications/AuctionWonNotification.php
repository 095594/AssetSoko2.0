<?php

namespace App\Notifications;

use App\Models\Asset;
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
    public function __construct(Asset $asset, $winningBid)
    {
        $this->asset = $asset;
        $this->winningBid = $winningBid;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Congratulations! You Won the Auction')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Congratulations! You have won the auction for ' . $this->asset->name)
            ->line('Your winning bid: $' . $this->winningBid)
            ->action('Proceed to Payment', route('payments.initiate', $this->asset))
            ->line('Please complete your payment within 24 hours to secure your purchase.')
            ->line('Thank you for using our platform!');
    }
} 