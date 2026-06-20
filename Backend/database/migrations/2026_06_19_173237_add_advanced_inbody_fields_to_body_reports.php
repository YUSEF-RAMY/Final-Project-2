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
        Schema::table('body_reports', function (Blueprint $table) {
            $table->integer('visceral_fat_level')->nullable();
            $table->decimal('waist_hip_ratio', 5, 2)->nullable();
            $table->decimal('trunk_fat_mass', 5, 2)->nullable();
            $table->decimal('trunk_lean_mass', 5, 2)->nullable();
            $table->integer('inbody_score')->nullable();
            $table->decimal('lbm', 5, 2)->nullable();
            $table->decimal('tdee', 8, 2)->nullable();
            $table->integer('calories')->nullable();
            $table->decimal('target_protein', 5, 2)->nullable();
            $table->decimal('target_carbs', 5, 2)->nullable();
            $table->decimal('target_fats', 5, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('body_reports', function (Blueprint $table) {
            $table->dropColumn([
                'visceral_fat_level', 'waist_hip_ratio', 'trunk_fat_mass', 
                'trunk_lean_mass', 'inbody_score', 'lbm', 'tdee', 
                'calories', 'target_protein', 'target_carbs', 'target_fats'
            ]);
        });
    }
};
