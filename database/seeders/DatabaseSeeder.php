<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@assetsoko.com',
            'password' => Hash::make('password'),
            'company_name' => 'Admin Company',
            'phone_number' => '0712345678',
            'address' => 'Nairobi, Kenya',
        ]);

        // Create regular user
        User::create([
            'name' => 'Regular User',
            'email' => 'user@assetsoko.com',
            'password' => Hash::make('password'),
            'company_name' => 'Regular Company',
            'phone_number' => '0712345679',
            'address' => 'Nairobi, Kenya',
        ]);

        // Create additional random users
        User::factory(8)->create();

        // Run asset seeder
        $this->call(AssetSeeder::class);
        $this->call(AuctionSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(PaymentMethodSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(AuctionNotificationTestSeeder::class);

        // Create some bids
        $assets = Asset::all();
        $users = User::where('email', '!=', 'admin@assetsoko.com')->get();

        foreach ($assets as $asset) {
            // Create 2-5 bids for each asset
            $numBids = rand(2, 5);
            $currentPrice = $asset->base_price;

            for ($i = 0; $i < $numBids; $i++) {
                $bidder = $users->random();
                $bidAmount = $currentPrice + rand(10, 50);
                $currentPrice = $bidAmount;

                Bid::create([
                    'asset_id' => $asset->id,
                    'user_id' => $bidder->id,
                    'amount' => $bidAmount,
                    'status' => 'active',
                ]);
            }
        }

        // Create some watchlist entries
        foreach ($users as $user) {
            // Each user watches 2-4 random assets
            $numWatchlist = rand(2, 4);
            $randomAssets = $assets->random($numWatchlist);

            foreach ($randomAssets as $asset) {
                Watchlist::create([
                    'user_id' => $user->id,
                    'asset_id' => $asset->id,
                ]);
            }
        }
    }
}
