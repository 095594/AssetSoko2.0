<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Events\CheckAuctionStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class BroadcastAuctionStatus extends Command
{
    protected $signature = 'auctions:broadcast-status';
    protected $description = 'Broadcast auction status every second using Pusher';

    public function handle()
    {
        $this->info('Starting auction status broadcaster...');
        Log::info('Starting auction status broadcaster');

        while (true) {
            try {
                // Get all active auctions
                $activeAuctions = Asset::where('status', 'active')->get();

                foreach ($activeAuctions as $auction) {
                    // Broadcast status check event
                    broadcast(new CheckAuctionStatus($auction))->toOthers();

                    // If auction has ended, process it
                    if (Carbon::now()->gte($auction->auction_end_time)) {
                        Log::info('Auction has ended via broadcaster', [
                            'auction_id' => $auction->id,
                            'name' => $auction->name,
                            'end_time' => $auction->auction_end_time
                        ]);

                        $auction->status = 'ended';
                        $auction->save();
                    }
                }

                // Sleep for 1 second
                sleep(1);
            } catch (\Exception $e) {
                Log::error('Error broadcasting auction status: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                sleep(1);
            }
        }
    }
}
