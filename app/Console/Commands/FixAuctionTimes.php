<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Carbon\Carbon;

class FixAuctionTimes extends Command
{
    protected $signature = 'assets:fix-times';
    protected $description = 'Fix auction end times for existing assets';

    public function handle()
    {
        $this->info('Starting to fix auction times...');
        
        $assets = Asset::whereNotNull('auction_end_time')->get();
        $count = 0;

        foreach ($assets as $asset) {
            $oldTime = $asset->auction_end_time;
            
            // Add 3 hours to compensate for the timezone difference
            $newTime = Carbon::parse($oldTime)->addHours(3);
            
            $asset->timestamps = false; // Prevent updated_at from being modified
            $asset->auction_end_time = $newTime;
            $asset->save();
            
            $this->info("Fixed asset ID {$asset->id}: {$oldTime} -> {$newTime}");
            $count++;
        }

        $this->info("Completed! Fixed {$count} assets.");
    }
} 