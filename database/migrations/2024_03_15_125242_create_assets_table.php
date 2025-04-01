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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 255);
            $table->text('description');
            $table->integer('quantity')->default(1);
            $table->string('category', 100);
            $table->enum('condition', ['new', 'used', 'refurbished']);
            $table->decimal('base_price', 10, 2);
            $table->decimal('reserve_price', 10, 2)->nullable(); // Optional minimum price for auction
            $table->decimal('current_price', 10, 2)->nullable(); // Will be updated during bidding
            $table->integer('bid_count')->default(0);
            $table->string('image_url', 255)->nullable(); // Main image URL
            $table->json('photos')->nullable(); // Additional photos in JSON array
            $table->enum('status', ['pending', 'active', 'inactive'])->default('pending');
            $table->timestamp('auction_start_time')->nullable(); // When auction becomes active
            $table->timestamp('auction_end_time')->nullable(); // When auction closes
            $table->timestamps();
            // $table->softDeletes(); // Uncomment if you need soft delete functionality
            
            // Add indexes for better performance
            $table->index('category');
            $table->index('status');
            $table->index('auction_end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};