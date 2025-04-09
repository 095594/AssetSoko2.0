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
            'channels' => ['mail', 'database']
        ]);
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        Log::info('Preparing WinningBidderNotification email', [
            'user_id' => $notifiable->id,
            'asset_id' => $this->asset->id
        ]);
        
        return (new MailMessage)
            ->subject('Congratulations! You Won the Auction')
            ->line("Congratulations! You have won the auction for {$this->asset->name}.")
            ->line("Your winning bid: KES " . number_format($this->bid->amount, 2))
            ->line("Please complete your payment to finalize the purchase.")
            ->action('Complete Payment Now', route('buyer.payments.initiate', $this->asset->id))
            ->line('Payment must be completed within 24 hours to secure your purchase.')
            ->line('Thank you for using our platform!');
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
            'message' => "Congratulations! You have won the auction for {$this->asset->name}. Your winning bid was KES " . number_format($this->bid->amount, 2) . ". Please complete your payment within 24 hours.",
            'payment_url' => route('buyer.payments.initiate', $this->asset->id),
            'type' => 'auction_won'
        ];

        Log::info('WinningBidderNotification data prepared', [
            'notification_data' => $data
        ]);

        return $data;
    }
} 