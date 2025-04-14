<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\TestQueueJob;
use Illuminate\Support\Facades\Log;

class TestQueue extends Command
{
    protected $signature = 'queue:test';
    protected $description = 'Test the queue system';

    public function handle()
    {
        $this->info('Dispatching test job...');
        
        try {
            TestQueueJob::dispatch();
            $this->info('Test job dispatched successfully');
            $this->info('Check storage/logs/laravel.log for job execution');
        } catch (\Exception $e) {
            $this->error('Error dispatching job: ' . $e->getMessage());
            Log::error('Queue test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 