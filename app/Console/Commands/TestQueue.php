<?php

namespace App\Console\Commands;

use App\Jobs\TestQueueJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TestQueue extends Command
{
    protected $signature = 'test:queue';
    protected $description = 'Test the queue system by dispatching a test job';

    public function handle()
    {
        try {
            $this->info('Checking database connection...');
            DB::connection()->getPdo();
            $this->info('Database connection is working!');

            $this->info('Dispatching test job...');
            TestQueueJob::dispatch();
            $this->info('Test job dispatched!');

            $this->info('Checking jobs table...');
            $jobs = DB::table('jobs')->get();
            $this->info('Jobs in queue: ' . $jobs->count());
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            Log::error('Queue test failed: ' . $e->getMessage());
        }
    }
} 