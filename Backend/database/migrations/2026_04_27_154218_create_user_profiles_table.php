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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            // البيانات الأساسية (Current Metrics)
            $table->integer('age')->nullable();
            $table->float('height')->nullable();
            $table->float('weight')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();

            // البيانات السلوكية والنشاط
            $table->string('activity_level')->nullable(); // e.g., sedentary, active
            $table->enum('primary_objective', ['lose_weight', 'build_muscle', 'maintain'])->nullable();
            $table->text('medical_conditions')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
