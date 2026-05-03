<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This file consolidates all observability and retry system tables into a single migration
     * for a clean 'migrate:fresh' state as requested.
     */
    public function up(): void
    {
        // 1. User-Facing InBody Requests Tracking
        Schema::create('in_body_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('trace_id')->unique();
            $table->string('image_path');
            $table->enum('status', ['processing', 'queued_for_retry', 'completed', 'failed'])->default('processing');
            $table->timestamps();
        });

        // 2. AI Service Retry Queue (Internal Buffer)
        Schema::create('ai_retry_queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('payload'); // Contains imagePath and extraData
            $table->uuid('trace_id')->index();
            $table->enum('status', ['processing', 'queued_for_retry', 'completed', 'failed'])->default('queued_for_retry');
            $table->integer('attempts_count')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_retry_queues');
        Schema::dropIfExists('in_body_requests');
    }
};
