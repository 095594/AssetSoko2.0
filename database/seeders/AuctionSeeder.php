<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Asset;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AuctionSeeder extends Seeder
{
    public function run()
    {
        $assets = Asset::where('status', 'active')->get();

        if ($assets->isEmpty()) {
            return;
        }

        foreach ($assets as $asset) {
            Auction::create([
                'asset_id' => $asset->id,
                'start_time' => Carbon::now(),
                'end_time' => Carbon::now()->addDays(rand(3, 14)),
                'status' => 'ongoing',
            ]);
        }
    }
}
