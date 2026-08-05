<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Corrective migration.
 *
 * The original billing-cycle migrations (2026_07_29_*) were run on this database
 * BEFORE the total_expense / total_paid / amount_paid columns were added to them,
 * so those columns never made it into the schema. That caused
 * "SQLSTATE[42S22] Unknown column 'total_expense'" when closing a billing month.
 *
 * Every change is guarded, so this migration is a no-op on fresh databases where
 * the original migrations already created these columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('billing_cycles', 'total_expense')) {
            Schema::table('billing_cycles', function (Blueprint $table) {
                $table->decimal('total_expense', 10, 2)->default(0)->after('end_date');
                $table->decimal('total_paid', 10, 2)->default(0)->after('total_expense');
            });
        }

        if (!Schema::hasColumn('member_dues', 'amount_paid')) {
            Schema::table('member_dues', function (Blueprint $table) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('amount_assigned');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('member_dues', 'amount_paid')) {
            Schema::table('member_dues', function (Blueprint $table) {
                $table->dropColumn('amount_paid');
            });
        }

        if (Schema::hasColumn('billing_cycles', 'total_expense')) {
            Schema::table('billing_cycles', function (Blueprint $table) {
                $table->dropColumn(['total_expense', 'total_paid']);
            });
        }
    }
};
