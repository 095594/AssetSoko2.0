<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('asset_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('viewed_at');
            $table->timestamps();
        });

        // Add last_active column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_active')->nullable();
            $table->string('status')->default('active');
            $table->boolean('is_admin')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('asset_views');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_active', 'status', 'is_admin']);
        });
    }
}; 