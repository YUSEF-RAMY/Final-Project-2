<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('body_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id');

            $table->string('report_image')->nullable();

            $table->float('weight')->nullable();
            $table->float('bmi')->nullable();
            $table->float('body_fat')->nullable();
            $table->float('muscle_mass')->nullable();
            $table->float('water_percentage')->nullable();
            $table->float('protein_mass')->nullable();
            $table->float('visceral_fat')->nullable();
            $table->float('bmr')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_reports');
    }
};
