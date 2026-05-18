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
        Schema::create('user_targets', function (Blueprint $table) {
            $table->id();
            // ربط الهدف باليوزر
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->decimal('daily_calories', 8, 2)->default(0);
            $table->decimal('target_protein', 8, 2)->default(0);
            $table->decimal('target_carbs', 8, 2)->default(0);
            $table->decimal('target_fats', 8, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_targets');
    }
};
