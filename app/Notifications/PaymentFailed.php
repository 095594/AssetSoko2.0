<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailed extends Notification implements ShouldQueue
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
        $paymentDetails = json_decode($this->payment->payment_details, true);
        $failureReason = $paymentDetails['result_desc'] ?? 'Unknown error';

        return (new MailMessage)
            ->subject('Payment Failed for ' . $this->payment->asset->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We regret to inform you that your payment of $' . number_format($this->payment->amount, 2) . ' for the asset: ' . $this->payment->asset->name . ' has failed.')
            ->line('Reason: ' . $failureReason)
            ->action('Try Payment Again', route('payments.create', $this->payment->asset))
            ->line('If you continue to experience issues, please contact our support team.')
            ->line('Thank you for using AssetSoko!');
    }

    public function toArray($notifiable)
    {
        $paymentDetails = json_decode($this->payment->payment_details, true);
        $failureReason = $paymentDetails['result_desc'] ?? 'Unknown error';

        return [
            'type' => 'payment_failed',
            'payment_id' => $this->payment->id,
            'asset_id' => $this->payment->asset_id,
            'amount' => $this->payment->amount,
            'failure_reason' => $failureReason,
            'asset_name' => $this->payment->asset->name
        ];
    }
} 