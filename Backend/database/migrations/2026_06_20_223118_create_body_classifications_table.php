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
        Schema::create('body_classifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('body_report_id')->constrained('body_reports')->cascadeOnDelete();
            $table->string('category')->nullable();
            $table->string('reasoning')->nullable();
            $table->json('metrics')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_classifications');
    }
};
