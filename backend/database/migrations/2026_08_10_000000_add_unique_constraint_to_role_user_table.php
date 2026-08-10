<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove duplicate user-role assignments (keep the earliest row) and
     * prevent them from ever being created again.
     */
    public function up(): void
    {
        $duplicateIds = DB::table('role_user as r1')
            ->join('role_user as r2', function ($join) {
                $join->on('r1.user_id', '=', 'r2.user_id')
                    ->on('r1.role_id', '=', 'r2.role_id')
                    ->on('r1.id', '>', 'r2.id');
            })
            ->pluck('r1.id');

        DB::table('role_user')->whereIn('id', $duplicateIds)->delete();

        Schema::table('role_user', function (Blueprint $table) {
            $table->unique(['user_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::table('role_user', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'role_id']);
        });
    }
};
