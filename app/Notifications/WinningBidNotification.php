<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WinningBidNotification extends Notification
{
    use Queueable;

    protected $auctionItem;
    protected $winningBid;

    public function __construct($auctionItem, $winningBid)
    {
        $this->auctionItem = $auctionItem;
        $this->winningBid = $winningBid;
    }

    public function via($notifiable)
    {
        return ['mail']; // Send via email
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('🎉 Congratulations! You Won the Auction!')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("You have won the auction for **{$this->auctionItem->name}**.")
            ->line("Winning Bid Amount: **Ksh {$this->winningBid->amount}**")
            ->action('View Your Item', url('/auctions/' . $this->auctionItem->id))
            ->line('Thank you for using Asset Soko!');
    }
}
