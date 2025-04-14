<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, drop the existing check constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');

        // Update any existing records that might have 'ended' status to 'inactive'
        DB::statement("UPDATE assets SET status = 'inactive' WHERE status NOT IN ('pending', 'active', 'inactive')");

        // Then add the new check constraint with 'ended' status
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text, 'ended'::text]))");
    }

    public function down(): void
    {
        // Revert back to original constraint
        DB::statement('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check');
        DB::statement("ALTER TABLE assets ADD CONSTRAINT assets_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text]))");
    }
};
