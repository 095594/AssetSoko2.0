<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessful extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Payment Successful for ' . $this->payment->asset->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your payment of $' . number_format($this->payment->amount, 2) . ' for the asset: ' . $this->payment->asset->name . ' has been processed successfully.')
            ->line('Payment Method: ' . ucfirst($this->payment->payment_method))
            ->line('Seller: ' . $this->payment->seller->name)
            ->action('View Payment Details', route('payments.status', $this->payment->asset))
            ->line('Thank you for using AssetSoko!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'payment_successful',
            'payment_id' => $this->payment->id,
            'asset_id' => $this->payment->asset_id,
            'amount' => $this->payment->amount,
            'seller_name' => $this->payment->seller->name,
            'asset_name' => $this->payment->asset->name
        ];
    }
} 