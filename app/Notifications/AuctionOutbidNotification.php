<?php

namespace App\Notifications;

use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuctionOutbidNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Auction Ended: ' . $this->asset->name)
            ->markdown('emails.auction-outbid', [
                'user' => $notifiable,
                'asset' => $this->asset,
                'winningBid' => $this->winningBid
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable)
    {
        return [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'final_bid_amount' => $this->winningBid->amount,
            'message' => "The auction for {$this->asset->name} has ended. Final winning bid: KES {$this->winningBid->amount}",
            'type' => 'auction_outbid'
        ];
    }
}
