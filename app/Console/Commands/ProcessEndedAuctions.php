<?php

namespace App\Console\Commands;

use App\Services\AuctionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessEndedAuctions extends Command
{
    protected $signature = 'auctions:process-ended';
    protected $description = 'Process ended auctions and notify winners';

    protected $auctionService;

    public function __construct(AuctionService $auctionService)
    {
        parent::__construct();
        $this->auctionService = $auctionService;
    }

    public function handle()
    {
        $this->info('Starting to process ended auctions...');
        Log::info('Starting ProcessEndedAuctions command');

        try {
            $result = $this->auctionService->processEndedAuctions();
            
            if ($result['success']) {
                $this->info("Successfully processed {$result['processed_count']} auctions");
                Log::info("Successfully processed {$result['processed_count']} auctions");
            } else {
                $this->error('Failed to process auctions');
                Log::error('Failed to process auctions', ['result' => $result]);
            }
        } catch (\Exception $e) {
            $this->error('Error processing auctions: ' . $e->getMessage());
            Log::error('Error in ProcessEndedAuctions command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 