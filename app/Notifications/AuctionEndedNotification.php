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

    protected $asset;
    protected $winningBid;

    public function __construct(Asset $asset, ?Bid $winningBid)
    {
        $this->asset = $asset;
        $this->winningBid = $winningBid;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        $message = (new MailMessage)
            ->subject('Auction Ended: ' . $this->asset->name);

        if ($this->winningBid) {
            $message->markdown('emails.auction-ended', [
                'asset' => $this->asset,
                'winningBid' => $this->winningBid,
                'user' => $notifiable
            ]);
        } else {
            $message->markdown('emails.auction-ended-no-bids', [
                'asset' => $this->asset,
                'user' => $notifiable
            ]);
        }

        return $message;
    }

    public function toArray($notifiable)
    {
        if ($this->winningBid) {
            return [
                'asset_id' => $this->asset->id,
                'asset_name' => $this->asset->name,
                'winning_bid_amount' => $this->winningBid->amount,
                'message' => "Your auction for {$this->asset->name} has ended. Winning bid: KES {$this->winningBid->amount}",
                'type' => 'auction_ended'
            ];
        }

        return [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'message' => "Your auction for {$this->asset->name} has ended with no winning bids",
            'type' => 'auction_ended_no_bids'
        ];
    }
} 