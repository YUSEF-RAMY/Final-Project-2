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
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('activity_level')->nullable()->change();
            $table->string('primary_objective')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->enum('activity_level', ['sedentary', 'active', 'very_active'])->nullable()->change();
            $table->enum('primary_objective', ['lose_weight', 'build_muscle', 'maintain'])->nullable()->change();
        });
    }
};

