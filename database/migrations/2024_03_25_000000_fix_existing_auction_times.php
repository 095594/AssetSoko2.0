<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FixExistingAuctionTimes extends Migration
{
    public function up()
    {
        // Get all assets where auction_end_time is not null
        $assets = DB::table('assets')->whereNotNull('auction_end_time')->get();
        
        foreach ($assets as $asset) {
            // The times in the database are in UTC, but they were stored incorrectly
            // We need to adjust them to match the intended local time
            $utcTime = Carbon::parse($asset->auction_end_time, 'UTC');
            $localTime = $utcTime->setTimezone(config('app.timezone'));
            
            // Update the asset with the correct UTC time
            DB::table('assets')
                ->where('id', $asset->id)
                ->update([
                    'auction_end_time' => $localTime->setTimezone('UTC')
                ]);
        }
    }

    public function down()
    {
        // If needed, you can revert the times back
        $assets = DB::table('assets')->whereNotNull('auction_end_time')->get();
        
        foreach ($assets as $asset) {
            $utcTime = Carbon::parse($asset->auction_end_time, 'UTC');
            $localTime = $utcTime->setTimezone(config('app.timezone'));
            
            DB::table('assets')
                ->where('id', $asset->id)
                ->update([
                    'auction_end_time' => $localTime->setTimezone('UTC')
                ]);
        }
    }
} 