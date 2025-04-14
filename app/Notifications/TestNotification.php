<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class TestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        Log::info('TestNotification created');
    }

    public function via($notifiable)
    {
        Log::info('TestNotification via called', ['channels' => ['mail', 'database']]);
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        Log::info('TestNotification toMail called');
        return (new MailMessage)
            ->subject('Test Notification')
            ->line('This is a test notification.');
    }

    public function toArray($notifiable)
    {
        Log::info('TestNotification toArray called');
        return [
            'message' => 'This is a test notification'
        ];
    }
}
