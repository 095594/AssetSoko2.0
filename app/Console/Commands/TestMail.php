<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Message;

class TestMail extends Command
{
    protected $signature = 'mail:test {email?}';
    protected $description = 'Test email configuration';

    public function handle()
    {
        $email = $this->argument('email') ?? config('mail.from.address');

        $this->info("Testing mail configuration...");
        Log::info("Testing mail configuration to: " . $email);

        try {
            Mail::raw('Test email from AssetSoko', function (Message $message) use ($email) {
                $message->to($email)
                    ->subject('AssetSoko Test Email');
            });

            $this->info("Test email sent successfully to: " . $email);
            Log::info("Test email sent successfully to: " . $email);
        } catch (\Exception $e) {
            $this->error("Failed to send test email: " . $e->getMessage());
            Log::error("Failed to send test email", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
