<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AuctionService;
use App\Models\Asset;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TestAuctionNotifications extends Command
{
    protected $signature = 'test:auction-notifications';
    protected $description = 'Test auction notifications by seeding and processing a test auction';

    protected $auctionService;

    public function __construct(AuctionService $auctionService)
    {
        parent::__construct();
        $this->auctionService = $auctionService;
    }

    public function handle()
    {
        $this->info('Starting auction notification test...');

        // Run the test seeder
        $this->call('db:seed', [
            '--class' => 'AuctionNotificationTestSeeder'
        ]);

        $this->info('Test data seeded. Waiting for auction to end...');

        // Get the test asset
        $asset = Asset::where('name', 'Test Auction Asset')->first();
        if (!$asset) {
            $this->error('Test asset not found!');
            return 1;
        }

        $this->info("Test asset ID: {$asset->id}");
        $this->info("Auction ends at: {$asset->auction_end_time}");
        
        // Set the auction to end in 10 seconds
        $asset->auction_end_time = now()->addSeconds(10);
        $asset->save();
        
        $this->info("Updated auction end time to: {$asset->auction_end_time}");
        $this->info("Waiting 15 seconds for auction to end...");
        
        // Wait for 15 seconds
        sleep(15);

        $this->info('Processing ended auctions...');
        
        try {
            // Process the ended auctions
            $this->auctionService->processEndedAuctions();
            $this->info('Successfully processed ended auctions');
            
            // Verify the notifications
            $asset->refresh();
            if ($asset->status === 'ended') {
                $this->info('Asset status updated to ended ✓');
            } else {
                $this->error('Asset status not updated! Current status: ' . $asset->status);
            }
            
            $this->info('Check your email for notifications:');
            $this->info('- seller@test.com');
            $this->info('- bidder@test.com');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error processing auctions: ' . $e->getMessage());
            Log::error('Error in test auction notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
