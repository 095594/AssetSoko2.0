<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->enum('condition', ['new', 'used', 'refurbished']);
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('starting_bid', 10, 2)->nullable();
            $table->decimal('current_bid', 10, 2)->nullable();
            $table->timestamp('end_date')->nullable();
            $table->enum('status', ['active', 'sold', 'expired'])->default('active');
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
