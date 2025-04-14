<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use Carbon\Carbon;

class CreateTestAuction extends Command
{
    protected $signature = 'auction:create-test';
    protected $description = 'Create a test auction that ends in 10 seconds';

    public function handle()
    {
        $asset = new Asset();
        $asset->name = 'Test Auction';
        $asset->description = 'Test auction ending in 10 seconds';
        $asset->base_price = 1000;
        $asset->current_price = 1000;
        $asset->reserve_price = 1000;
        $asset->category = 'test';
        $asset->condition = 'new';
        $asset->status = 'active';
        $asset->auction_end_time = Carbon::now('UTC')->addSeconds(10);
        $asset->user_id = 1;
        $asset->save();

        $this->info('Created test auction with ID: ' . $asset->id);
        $this->info('Auction will end at: ' . $asset->auction_end_time->format('Y-m-d H:i:s'));
    }
}
