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
        Schema::create('meal_foods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_id')->constrained('meals')->onDelete('cascade');
            $table->foreignId('food_id')->constrained('foods')->onDelete('cascade');

            $table->decimal('quantity', 8, 2)->default(1);

            // Snapshots
            $table->integer('calories');
            $table->integer('protein');
            $table->integer('carbs');
            $table->integer('fat');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_foods');
    }
};
