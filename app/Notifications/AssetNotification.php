<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;
    protected $data;

    public function __construct(string $message, array $data = [])
    {
        $this->message = $message;
        $this->data = $data;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'message' => $this->message,
            'data' => $this->data,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->line($this->message)
            ->action('View Details', url('/dashboard'))
            ->line('Thank you for using our application!');
    }
} 