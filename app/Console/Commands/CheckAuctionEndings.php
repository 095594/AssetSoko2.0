<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckAuctionEndings extends Command
{
    protected $signature = 'auctions:check-endings';
    protected $description = 'Check and process auctions that have reached their end time';

    public function handle()
    {
        Log::info('Starting auction endings check at: ' . now());
        $this->info('Starting auction endings check at: ' . now());

        // Log all active auctions and their end times
        $activeAuctions = Asset::where('status', 'active')
            ->whereHas('auction', function ($query) {
                $query->where('end_time', '<=', now());
            })
            ->with('auction')
            ->get();

        Log::info('Found ' . $activeAuctions->count() . ' auctions to check');
        $this->info('Found ' . $activeAuctions->count() . ' auctions to check');

        foreach ($activeAuctions as $asset) {
            Log::info("Processing auction: {$asset->name} (ID: {$asset->id})", [
                'end_time' => $asset->auction->end_time,
                'current_time' => now(),
                'status' => $asset->status
            ]);
            
            $this->info("Processing auction: {$asset->name} (ID: {$asset->id})");
            
            try {
                // Double check if the auction should end
                if ($asset->auction->end_time <= now() && $asset->status === 'active') {
                    $asset->status = 'ended';
                    $asset->save(); // This will trigger the processEndedAuction method
                    
                    Log::info("Successfully ended auction", [
                        'asset_id' => $asset->id,
                        'asset_name' => $asset->name,
                        'end_time' => $asset->auction->end_time,
                        'processed_at' => now()
                    ]);
                    
                    $this->info("Successfully ended auction: {$asset->name}");
                } else {
                    Log::info("Auction not ready to end", [
                        'asset_id' => $asset->id,
                        'end_time' => $asset->auction->end_time,
                        'current_time' => now(),
                        'status' => $asset->status
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Failed to process auction", [
                    'asset_id' => $asset->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                $this->error("Failed to process auction {$asset->id}: " . $e->getMessage());
            }
        }

        Log::info('Finished checking auctions at: ' . now());
        $this->info('Finished checking auctions at: ' . now());
        
        return 0;
    }
} 