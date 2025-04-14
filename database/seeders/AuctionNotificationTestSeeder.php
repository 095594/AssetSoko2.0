<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Asset;
use App\Models\Bid;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class AuctionNotificationTestSeeder extends Seeder
{
    public function run()
    {
        // Get or create seller
        $seller = User::firstOrCreate(
            ['email' => 'seller@test.com'],
            [
                'name' => 'Test Seller',
                'password' => Hash::make('password'),
                'role' => 'seller',
                'phone_number' => '1234567890',
                'last_active' => now(),
            ]
        );

        // Get or create bidder
        $bidder = User::firstOrCreate(
            ['email' => 'bidder@test.com'],
            [
                'name' => 'Test Bidder',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'phone_number' => '0987654321',
                'last_active' => now(),
            ]
        );

        // Delete any existing test assets and their bids
        $existingAsset = Asset::where('name', 'Test Auction Asset')->first();
        if ($existingAsset) {
            Bid::where('asset_id', $existingAsset->id)->delete();
            $existingAsset->delete();
        }

        // Create a new test asset
        $asset = Asset::create([
            'name' => 'Test Auction Asset',
            'description' => 'This is a test asset for auction notification testing',
            'user_id' => $seller->id,
            'base_price' => 1000,
            'reserve_price' => 1200,
            'current_price' => 1000,
            'status' => 'active',
            'condition' => 'new',
            'category' => 'test',
            'auction_end_time' => now()->addMinutes(2),
            'image' => 'test.jpg',
            'quantity' => 1,
            'bid_count' => 0,
        ]);

        // Create a new bid
        $bid = Bid::create([
            'user_id' => $bidder->id,
            'asset_id' => $asset->id,
            'amount' => 1500,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Created test seller: seller@test.com / password');
        $this->command->info('Created test bidder: bidder@test.com / password');
        $this->command->info('Created test asset that will end in 2 minutes');
        $this->command->info('Created test bid');
    }
}
