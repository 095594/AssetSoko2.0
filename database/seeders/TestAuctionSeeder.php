<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\User;
use Carbon\Carbon;

class TestAuctionSeeder extends Seeder
{
    public function run()
    {
        // Create test users if they don't exist
        $seller = User::firstOrCreate(
            ['email' => 'seller@test.com'],
            [
                'name' => 'Test Seller',
                'password' => bcrypt('password'),
                'phone_number' => '254700000001',
                'role' => 'seller'
            ]
        );

        $bidder = User::firstOrCreate(
            ['email' => 'bidder@test.com'],
            [
                'name' => 'Test Bidder',
                'password' => bcrypt('password'),
                'phone_number' => '254700000002',
                'role' => 'buyer'
            ]
        );

        // Create test asset
        $asset = Asset::create([
            'name' => 'Test Asset',
            'description' => 'Test asset for payment testing',
            'base_price' => 1000,
            'auction_end_time' => Carbon::now()->addMinutes(5),
            'user_id' => $seller->id,
            'status' => 'active',
            'category' => 'test',
            'condition' => 'new',
            'reserve_price' => 1000,
            'current_price' => 1000,
            'image_url' => 'test.jpg',
            'quantity' => 1,
            'bid_count' => 0,
            'auction_start_time' => Carbon::now()
        ]);

        // Create test bid
        $bid = Bid::create([
            'asset_id' => $asset->id,
            'user_id' => $bidder->id,
            'amount' => 1500,
            'status' => 'pending'
        ]);

        $this->command->info('Test auction data created successfully!');
        $this->command->info('Asset ID: ' . $asset->id);
        $this->command->info('Bid ID: ' . $bid->id);
        $this->command->info('Seller Email: seller@test.com');
        $this->command->info('Bidder Email: bidder@test.com');
        $this->command->info('Password for both: password');
    }
} 