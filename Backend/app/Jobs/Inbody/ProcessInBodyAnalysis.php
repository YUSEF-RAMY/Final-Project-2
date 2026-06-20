<?php

namespace App\Jobs\Inbody;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Enums\ActivityLevel;
use App\Enums\PrimaryObjective;
use App\Jobs\Middleware\JobLoggingMiddleware;
use App\Models\AiRetryQueue;
use App\Models\InBodyRequest;
use App\Models\User;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\Inbody\InBodyService;
use App\Services\LogService;
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
                    'status' => 'processing',
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
                    'extraData' => $this->extraData,
                ],
                'trace_id' => $this->trace_id ?? 'unknown',
                'status' => 'queued_for_retry',
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
        $ocrResult = $inBodyService->processInBodyImage($this->user, $this->imagePath, $this->extraData);
        $aiData = $this->sanitizeAiData($ocrResult['ai_data']);

        $activityMap = [
            1 => ActivityLevel::SEDENTARY,
            2 => ActivityLevel::LIGHTLY_ACTIVE,
            3 => ActivityLevel::MODERATELY_ACTIVE,
            4 => ActivityLevel::VERY_ACTIVE,
            5 => ActivityLevel::EXTRA_ACTIVE,
        ];
        $internalActivity = $activityMap[$this->extraData['activity_level'] ?? 3] ?? ActivityLevel::MODERATELY_ACTIVE;

        $goalMap = [
            'lose_fat' => PrimaryObjective::LOSE_WEIGHT,
            'maintain' => PrimaryObjective::MAINTAIN,
            'gain_muscle' => PrimaryObjective::BUILD_MUSCLE,
        ];
        $internalObjective = $goalMap[$this->extraData['goal'] ?? 'maintain'] ?? PrimaryObjective::MAINTAIN;

        $inputDto = NutritionAnalysisInputDTO::fromArray([
            'weight' => $aiData['weight'] ?? $this->user->profile?->weight ?? 0,
            'height' => $aiData['height'] ?? $this->user->profile?->height ?? 0,
            'age' => $aiData['age'] ?? $this->user->profile?->age ?? 0,
            'gender' => $aiData['gender'] ?? $this->user->profile?->gender ?? 'male',
            'bmi' => $aiData['bmi'] ?? 0,
            'bmr' => $aiData['bmr'] ?? 0,
            'activity_level' => $internalActivity,
            'primary_objective' => $internalObjective,
            'medical_conditions' => $this->extraData['disease_condition'] ?? null,
            'inbody_data' => array_merge([
                'report_image' => $ocrResult['image_path'],
            ], $aiData),
        ]);

        $report = $syncAction->execute($this->user, $inputDto);

        if ($report && $report->exists) {
            $this->user->notify(new InBodyAnalyzedNotification($report, $this->trace_id));
        } else {
            LogService::log(
                channel: 'notifications',
                event: 'notification_skipped',
                layer: 'notification',
                status: 'failed',
                userId: $this->user->id,
                context: ['reason' => 'Body report creation failed or returned null', 'trace_id' => $this->trace_id]
            );
        }
    }

    private function sanitizeAiData(array $data): array
    {
        $numericFields = [
            'weight', 'height', 'bmi', 'bmr', 'smm', 'pbf', 'body_fat_mass', 'water', 'protein', 'minerals',
            'visceral_fat_level', 'waist_hip_ratio', 'trunk_fat_mass', 'trunk_lean_mass', 'lbm', 'tdee',
            'calories', 'target_protein', 'target_carbs', 'target_fats',
        ];

        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $val = (float) $data[$field];

                // Fix obvious scaling issues from AI (e.g., grams vs kg, or scaled percentages)
                // If PBF or Body Fat Mass are > 1000, they are likely scaled by 1000
                if (($field === 'pbf' || $field === 'body_fat_mass') && $val > 1000) {
                    $val = $val / 1000;
                }

                // Clamp values to fit decimal(5,2) which is max 999.99
                // bmr, tdee are decimal(8,2), and calories is int, so they can be larger
                if (in_array($field, ['bmr', 'tdee', 'calories'])) {
                    $data[$field] = min($val, 999999.99);
                } else {
                    $data[$field] = min($val, 999.99);
                }
            }
        }

        return $data;
    }
}
