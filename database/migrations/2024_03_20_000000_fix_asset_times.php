<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class FixAssetTimes extends Migration
{
    public function up()
    {
        // Get all assets
        $assets = DB::table('assets')->get();
        
        foreach ($assets as $asset) {
            // The times in the database are in UTC, so we need to adjust them
            // to match the local time that was intended
            $localTime = Carbon::parse($asset->auction_end_time)
                ->addHours(3); // Adjust by 3 hours to match local time
            
            // Update the asset with the adjusted time
            DB::table('assets')
                ->where('id', $asset->id)
                ->update([
                    'auction_end_time' => $localTime
                ]);
        }
    }

    public function down()
    {
        // If needed, you can revert the times back
        $assets = DB::table('assets')->get();
        
        foreach ($assets as $asset) {
            $utcTime = Carbon::parse($asset->auction_end_time)
                ->subHours(3); // Subtract 3 hours to revert to UTC
            
            DB::table('assets')
                ->where('id', $asset->id)
                ->update([
                    'auction_end_time' => $utcTime
                ]);
        }
    }
} 