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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');

            // Permanent attribution of an expense to the billing cycle whose
            // date range contains its date (FK is valid because the
            // billing_cycles migration now runs before this one).
            $table->foreignId('billing_cycle_id')->nullable()->constrained()->nullOnDelete();
            $table->index(['billing_cycle_id', 'date']);

            $table->string('title');
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->date('date');

            $table->foreignId('updated_by')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
