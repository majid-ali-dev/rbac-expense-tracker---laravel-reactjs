<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('billing_cycle_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->index(['billing_cycle_id', 'date']);
        });

        // Backfill existing expenses into the cycle whose date range contains
        // their date, so historical data is permanently traceable to a cycle.
        $cycles = DB::table('billing_cycles')->orderBy('start_date')->get(['id', 'start_date', 'end_date']);

        foreach ($cycles as $cycle) {
            DB::table('expenses')
                ->whereNull('billing_cycle_id')
                ->whereBetween('date', [$cycle->start_date, $cycle->end_date])
                ->update(['billing_cycle_id' => $cycle->id]);
        }
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['billing_cycle_id', 'date']);
            $table->dropConstrainedForeignId('billing_cycle_id');
        });
    }
};
