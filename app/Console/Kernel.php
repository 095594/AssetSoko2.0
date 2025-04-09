<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Carbon\Carbon;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\CheckAuctionCompletion::class,
        Commands\FixAuctionTimes::class,
        Commands\TestQueue::class,
        Commands\NotifyEndingAuctions::class,
        Commands\CleanupNotifications::class,
        Commands\TestScheduler::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * These schedules are run in a default environment.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        // Debug scheduler
        $schedule->call(function () {
            \Log::info('Scheduler is running at: ' . now());
        })->everyMinute();

        // Check for completed auctions every minute
        $schedule->command('auctions:check-completion')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/auction-completion.log'))
            ->onSuccess(function () {
                \Log::info('Auction completion check completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Auction completion check failed');
            });

        // Simple test command
        $schedule->call(function () {
            $now = Carbon::now();
            $message = sprintf(
                "Scheduler test at: %s (Timezone: %s)\n",
                $now->format('Y-m-d H:i:s'),
                config('app.timezone')
            );
            \Log::info($message);
            file_put_contents(storage_path('logs/scheduler-test.log'), $message, FILE_APPEND);
        })->everyMinute();

        // Test scheduler command
        $schedule->command('test:scheduler')
            ->everyMinute()
            ->appendOutputTo(storage_path('logs/test-scheduler.log'))
            ->onSuccess(function () {
                \Log::info('Test scheduler command completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Test scheduler command failed');
            });

        // Send notifications for ending auctions (5 minutes before end)
        $schedule->command('auctions:notify-ending')
            ->everyMinute()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/auction-notifications.log'))
            ->onSuccess(function () {
                \Log::info('Auction notifications sent successfully');
            })
            ->onFailure(function () {
                \Log::error('Auction notifications failed');
            });

        // Clean up old notifications and logs
        $schedule->command('notifications:cleanup')
            ->daily()
            ->appendOutputTo(storage_path('logs/cleanup.log'))
            ->onSuccess(function () {
                \Log::info('Cleanup completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Cleanup failed');
            });

        // Backup database daily at midnight
        $schedule->command('backup:run --only-db')
            ->dailyAt('00:00')
            ->appendOutputTo(storage_path('logs/backup.log'));
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 