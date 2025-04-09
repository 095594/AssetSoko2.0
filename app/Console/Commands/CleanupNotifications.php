<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanupNotifications extends Command
{
    protected $signature = 'notifications:cleanup';
    protected $description = 'Clean up old notifications and logs';

    public function handle()
    {
        $this->info('Starting cleanup process...');

        // Delete notifications older than 30 days
        $deleted = DB::table('notifications')
            ->where('created_at', '<', Carbon::now()->subDays(30))
            ->delete();

        $this->info("Deleted {$deleted} old notifications");

        // Clean up log files older than 7 days
        $logPath = storage_path('logs');
        $files = glob($logPath . '/*.log');
        $deletedFiles = 0;

        foreach ($files as $file) {
            if (filemtime($file) < time() - (7 * 24 * 60 * 60)) {
                unlink($file);
                $deletedFiles++;
            }
        }

        $this->info("Deleted {$deletedFiles} old log files");
        $this->info('Cleanup process completed.');
    }
} 