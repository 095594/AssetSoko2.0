<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Support\Facades\Log;

class WinningBidderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;
    protected $bid;

    public function __construct(Asset $asset, Bid $bid)
    {
        $this->asset = $asset;
        $this->bid = $bid;
        Log::info('Creating WinningBidderNotification', [
            'asset_id' => $asset->id,
            'bid_id' => $bid->id,
            'user_id' => $bid->user_id
        ]);
    }

    public function via($notifiable)
    {
        Log::info('Sending WinningBidderNotification via channels', [
            'user_id' => $notifiable->id,
            'channels' => ['mail', 'database', 'broadcast']
        ]);
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        try {
            Log::info('Preparing WinningBidderNotification email', [
                'user_id' => $notifiable->id,
                'asset_id' => $this->asset->id,
                'bid_id' => $this->bid->id
            ]);
            
            $mailMessage = (new MailMessage)
                ->subject('Congratulations! You Won the Auction: ' . $this->asset->name)
                ->markdown('emails.winning-bidder', [
                    'asset' => $this->asset,
                    'bid' => $this->bid,
                    'user' => $notifiable
                ])
                ->line('Payment must be completed within 24 hours to secure your purchase.')
                ->line('Thank you for using our platform!');

            Log::info('Successfully prepared WinningBidderNotification email', [
                'user_id' => $notifiable->id,
                'asset_id' => $this->asset->id
            ]);

            return $mailMessage;
        } catch (\Exception $e) {
            Log::error('Error preparing WinningBidderNotification email', [
                'user_id' => $notifiable->id,
                'asset_id' => $this->asset->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function toArray($notifiable)
    {
        Log::info('Preparing WinningBidderNotification database record', [
            'user_id' => $notifiable->id,
            'asset_id' => $this->asset->id,
            'bid_id' => $this->bid->id
        ]);

        $data = [
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'bid_amount' => $this->bid->amount,
            'message' => "Congratulations! You won the auction for {$this->asset->name} with a bid of KES {$this->bid->amount}",
            'payment_url' => route('buyer.payments.initiate', $this->asset->id),
            'type' => 'auction_won'
        ];

        Log::info('WinningBidderNotification data prepared', [
            'notification_data' => $data
        ]);

        return $data;
    }
} 