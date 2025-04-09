<?php

namespace App\Notifications;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuctionEndingSoon extends Notification implements ShouldQueue
{
    use Queueable;

    protected $auction;
    protected $type;

    public function __construct(Auction $auction, $type)
    {
        $this->auction = $auction;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $minutes = $this->auction->end_time->diffInMinutes(now());
        $subject = $this->type === 'seller' 
            ? "Your auction is ending in {$minutes} minutes" 
            : "Auction you're bidding on is ending in {$minutes} minutes";

        return (new MailMessage)
            ->subject($subject)
            ->line("The auction for {$this->auction->asset->name} is ending soon!")
            ->action('View Auction', route('auctions.show', $this->auction->id))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        $minutes = $this->auction->end_time->diffInMinutes(now());
        return [
            'auction_id' => $this->auction->id,
            'asset_name' => $this->auction->asset->name,
            'message' => $this->type === 'seller'
                ? "Your auction for {$this->auction->asset->name} is ending in {$minutes} minutes"
                : "The auction for {$this->auction->asset->name} is ending in {$minutes} minutes",
            'type' => 'auction_ending',
            'minutes_remaining' => $minutes
        ];
    }
} 