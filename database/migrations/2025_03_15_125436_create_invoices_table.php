<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade'); // Link to the order
            $table->string('invoice_number')->unique(); // Unique invoice number
            $table->decimal('total_amount', 10, 2); // Total amount of the invoice
            $table->date('issue_date'); // Date the invoice was issued
            $table->date('due_date'); // Due date for the invoice
            $table->string('status')->default('unpaid'); // Invoice status (e.g., unpaid, paid)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
