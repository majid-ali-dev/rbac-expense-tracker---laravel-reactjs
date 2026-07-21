<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expense_id')->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->string('changed_fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_histories');
    }
};
