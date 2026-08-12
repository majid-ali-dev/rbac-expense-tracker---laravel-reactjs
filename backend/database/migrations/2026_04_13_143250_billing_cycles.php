<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NOTE: this migration intentionally runs BEFORE expenses/payments so those
     * tables can declare a foreign key back to billing_cycles in their own
     * create migrations (no extra ALTER migration needed).
     */
    public function up(): void
    {
        Schema::create('billing_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_expense', 10, 2)->default(0);
            $table->decimal('total_paid', 10, 2)->default(0);
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_cycles');
    }
};