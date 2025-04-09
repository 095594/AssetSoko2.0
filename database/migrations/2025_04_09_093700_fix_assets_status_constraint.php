<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixAssetsStatusConstraint extends Migration
{
    public function up()
    {
        // First, drop the existing constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');
        
        // Update any invalid status values to 'active'
        DB::statement("UPDATE assets SET status = 'active' WHERE status NOT IN ('active', 'completed', 'cancelled', 'pending', 'sold')");
        
        // Then add the new constraint with all allowed statuses
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status IN ('active', 'completed', 'cancelled', 'pending', 'sold'))");
    }

    public function down()
    {
        // Drop the new constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');
        
        // Re-add the original constraint if needed
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status IN ('active', 'completed', 'cancelled', 'pending'))");
    }
} 