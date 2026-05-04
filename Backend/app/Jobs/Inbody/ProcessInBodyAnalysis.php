<?php

namespace App\Jobs\Inbody;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Models\User;
use App\Models\AiRetryQueue;
use App\Models\InBodyRequest;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\Inbody\InBodyService;
use App\Services\LogService;
use App\Jobs\Middleware\JobLoggingMiddleware;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInBodyAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 1;
    public $trace_id;

    public function __construct(public User $user, protected string $imagePath, protected array $extraData)
    {
        $this->trace_id = app()->bound('trace_id') ? app('trace_id') : null;

        // Ensure we track this request for the user
        if ($this->trace_id) {
            InBodyRequest::updateOrCreate(
                ['trace_id' => $this->trace_id],
                [
                    'user_id' => $this->user->id,
                    'image_path' => $this->imagePath,
                    'status' => 'processing'
                ]
            );
        }
    }

    public function middleware()
    {
        return [new JobLoggingMiddleware];
    }

    public function handle(InBodyService $inBodyService, SyncNutritionStateAction $syncAction): void
    {
        try {
            $this->executeAnalysisPipeline($inBodyService, $syncAction);
            
            // Update user-facing status
            if ($this->trace_id) {
                InBodyRequest::where('trace_id', $this->trace_id)->update(['status' => 'completed']);
            }

        } catch (\Throwable $e) {
            // Log AI Failure
            LogService::log(
                channel: 'ai',
                event: 'ai_service_unavailable',
                layer: 'ai',
                status: 'failed',
                userId: $this->user->id,
                context: ['error' => $e->getMessage()]
            );

            // Buffer for retry
            AiRetryQueue::create([
                'user_id' => $this->user->id,
                'payload' => [
                    'imagePath' => $this->imagePath,
                    'extraData' => $this->extraData
                ],
                'trace_id' => $this->trace_id ?? 'unknown',
                'status' => 'queued_for_retry'
            ]);

            // Update user-facing status
            if ($this->trace_id) {
                InBodyRequest::where('trace_id', $this->trace_id)->update(['status' => 'queued_for_retry']);
            }

            LogService::log(
                channel: 'jobs',
                event: 'job_queued_for_retry',
                layer: 'retry',
                userId: $this->user->id,
                context: ['trace_id' => $this->trace_id]
            );
        }
    }

    public function executeAnalysisPipeline(InBodyService $inBodyService, SyncNutritionStateAction $syncAction): void
    {
        $ocrResult = $inBodyService->processInBodyImage($this->user, $this->imagePath);
        $aiData = $ocrResult['ai_data'];

        $inputDto = NutritionAnalysisInputDTO::fromArray([
            'weight' => $aiData['weight'] ?? $this->user->profile?->weight ?? 0,
            'height' => $aiData['height'] ?? $this->user->profile?->height ?? 0,
            'age' => $aiData['age'] ?? $this->user->profile?->age ?? 0,
            'gender' => $aiData['gender'] ?? $this->user->profile?->gender ?? 'male',
            'bmi' => $aiData['bmi'] ?? 0,
            'bmr' => $aiData['bmr'] ?? 0,
            'activity_level' => $this->extraData['activity_level'],
            'primary_objective' => $this->extraData['primary_objective'],
            'medical_conditions' => $this->extraData['medical_conditions'] ?? null,
            'inbody_data' => [
                'report_image' => $ocrResult['image_path'],
                'smm' => $aiData['smm'] ?? 0,
                'pbf' => $aiData['pbf'] ?? 0,
                'body_fat_mass' => $aiData['body_fat_mass'] ?? 0,
                'bmi' => $aiData['bmi'] ?? 0,
                'bmr' => $aiData['bmr'] ?? 0,
                'water' => $aiData['water'] ?? 0,
                'protein' => $aiData['protein'] ?? 0,
                'minerals' => $aiData['minerals'] ?? 0,
            ],
        ]);

        $syncAction->execute($this->user, $inputDto);

        $report = $this->user->body_report()->latest()->first();
        $this->user->notify(new InBodyAnalyzedNotification($report));
    }
}
