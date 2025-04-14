<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TestScheduler extends Command
{
    protected $signature = 'test:scheduler';
    protected $description = 'Test if the scheduler is working';

    public function handle()
    {
        $this->info('Testing scheduler at: ' . now()->toDateTimeString());
        Log::info('Scheduler test command executed at: ' . now()->toDateTimeString());
        
        // Check if we can write to the log file
        $logPath = storage_path('logs/laravel.log');
        if (is_writable($logPath)) {
            $this->info('Log file is writable');
            Log::info('Log file permissions check: writable');
        } else {
            $this->error('Log file is not writable');
            Log::error('Log file permissions check: not writable');
        }

        // Check timezone
        $this->info('Current timezone: ' . config('app.timezone'));
        $this->info('PHP timezone: ' . date_default_timezone_get());
        
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
        
        return 0;
    }
}