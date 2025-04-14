<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckAuctionsEverySecond extends Command
{
    protected $signature = 'auctions:check-every-second';
    protected $description = 'Check for ended auctions every second';

    public function handle()
    {
        Log::info('Starting auction checker every second');
        
        // Get current time in UTC
        $currentTime = Carbon::now('UTC');
        Log::info('Current time (UTC): ' . $currentTime->format('Y-m-d H:i:s'));
        
        // Find auctions that have ended using PostgreSQL's NOW() function
        $auctions = Asset::where('status', 'active')
            ->whereRaw('auction_end_time <= NOW() AT TIME ZONE ? AT TIME ZONE ?::text', ['UTC', 'Africa/Nairobi'])
            ->get();
            
        Log::info('Found ' . $auctions->count() . ' ended auctions');
        
        foreach ($auctions as $auction) {
            Log::info('Processing auction: ' . $auction->id);
            Log::info('Auction end time (UTC): ' . $auction->auction_end_time->format('Y-m-d H:i:s'));
            
            try {
                $auction->processEndedAuction();
                Log::info('Successfully processed auction: ' . $auction->id);
            } catch (\Exception $e) {
                Log::error('Error processing auction: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
            }
        }
    }
}
