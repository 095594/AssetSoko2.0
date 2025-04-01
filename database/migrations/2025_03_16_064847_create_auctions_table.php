<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_time')->default(DB::raw('CURRENT_TIMESTAMP')); // Ensure default start time
            $table->timestamp('end_time')->nullable(); // Allow null values to prevent default value error
            $table->decimal('current_price', 10, 2)->default(0);
            $table->enum('status', ['ongoing', 'ended', 'cancelled'])->default('ongoing');
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
