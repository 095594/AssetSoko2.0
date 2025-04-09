<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;

class TestScheduler extends Command
{
    protected $signature = 'test:scheduler';
    protected $description = 'Test if the scheduler is working';

    public function handle()
    {
        $now = Carbon::now();
        $message = sprintf(
            "Test scheduler command executed at: %s (Timezone: %s)\n",
            $now->format('Y-m-d H:i:s'),
            config('app.timezone')
        );
        
        $this->info($message);
        \Log::info($message);
        
        // Write to a specific test file
        $logFile = storage_path('logs/test-scheduler.log');
        file_put_contents($logFile, $message, FILE_APPEND);
        
        // Also write to Laravel log
        \Log::channel('daily')->info($message);
    }
} 