<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update any existing records that might have invalid status
        DB::statement("UPDATE assets SET status = 'pending' WHERE status NOT IN ('pending', 'active', 'inactive')");

        // Remove the existing check constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');

        // Then, add the new check constraint with updated values
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text, 'completed'::text]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First, update any records with 'completed' status to 'inactive'
        DB::statement("UPDATE assets SET status = 'inactive' WHERE status = 'completed'");

        // Remove the new check constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');

        // Then, add back the original check constraint
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text]))");
    }
};
