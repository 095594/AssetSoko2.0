<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceived extends Notification implements ShouldQueue
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
            ->subject('Payment Received for ' . $this->payment->asset->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a payment of $' . number_format($this->payment->amount, 2) . ' for your asset: ' . $this->payment->asset->name)
            ->line('Payment Method: ' . ucfirst($this->payment->payment_method))
            ->line('Buyer: ' . $this->payment->buyer->name)
            ->action('View Payment Details', route('payments.status', $this->payment->asset))
            ->line('Thank you for using AssetSoko!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'payment_received',
            'payment_id' => $this->payment->id,
            'asset_id' => $this->payment->asset_id,
            'amount' => $this->payment->amount,
            'buyer_name' => $this->payment->buyer->name,
            'asset_name' => $this->payment->asset->name
        ];
    }
} 