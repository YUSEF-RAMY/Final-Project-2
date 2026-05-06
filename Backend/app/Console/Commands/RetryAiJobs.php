<?php

namespace App\Console\Commands;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Models\AiRetryQueue;
use App\Models\InBodyRequest;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\Inbody\InBodyService;
use App\Services\LogService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class RetryAiJobs extends Command
{
    protected $signature = 'ai:retry-pending-jobs';

    protected $description = 'Retry failed AI analysis requests from the buffer table.';

    public function handle(InBodyService $inBodyService, SyncNutritionStateAction $syncAction): int
    {
        $pendingJobs = AiRetryQueue::where('status', 'queued_for_retry')
            ->where('attempts_count', '<', 24)
            ->get();

        if ($pendingJobs->isEmpty()) {
            $this->info('No pending AI retry requests found.');

            return 0;
        }

        $this->info("Found {$pendingJobs->count()} pending retry request(s).");

        foreach ($pendingJobs as $retryItem) {
            $this->processRetry($retryItem, $inBodyService, $syncAction);
        }

        return 0;
    }

    private function processRetry(AiRetryQueue $retryItem, InBodyService $inBodyService, SyncNutritionStateAction $syncAction): void
    {
        $user = $retryItem->user;

        if (! $user) {
            $retryItem->update(['status' => 'failed']);
            $this->error("User not found for retry item #{$retryItem->id}");

            return;
        }

        app()->instance('trace_id', $retryItem->trace_id);

        LogService::log(
            channel: 'jobs',
            event: 'ai_retry_attempt_started',
            layer: 'retry',
            userId: $user->id,
            context: ['retry_item_id' => $retryItem->id, 'attempt' => $retryItem->attempts_count + 1]
        );

        $retryItem->update([
            'status' => 'processing',
            'attempts_count' => $retryItem->attempts_count + 1,
            'last_attempt_at' => Carbon::now(),
        ]);

        try {
            $payload = $retryItem->payload;
            $imagePath = $payload['imagePath'] ?? $payload['file_path'] ?? '';
            $extraData = $payload['extraData'] ?? [];

            // Step 1: Call AI service directly
            $ocrResult = $inBodyService->processInBodyImage($user, $imagePath);
            $aiData = $this->sanitizeAiData($ocrResult['ai_data']);

            // Step 2: Build DTO and sync
            $inputDto = NutritionAnalysisInputDTO::fromArray([
                'weight' => $aiData['weight'] ?? $user->profile?->weight ?? 0,
                'height' => $aiData['height'] ?? $user->profile?->height ?? 0,
                'age' => $aiData['age'] ?? $user->profile?->age ?? 0,
                'gender' => $aiData['gender'] ?? $user->profile?->gender ?? 'male',
                'bmi' => $aiData['bmi'] ?? 0,
                'bmr' => $aiData['bmr'] ?? 0,
                'activity_level' => $extraData['activity_level'] ?? 'moderate',
                'primary_objective' => $extraData['primary_objective'] ?? 'maintain',
                'medical_conditions' => $extraData['medical_conditions'] ?? null,
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

            $report = $syncAction->execute($user, $inputDto);

            // Step 3: Send notification
            if ($report && $report->exists) {
                $user->notify(new InBodyAnalyzedNotification($report, $retryItem->trace_id));
                $this->info("✅ Retry succeeded for user {$user->id} (report #{$report->id})");
            }

            // Step 4: Update statuses
            $retryItem->update(['status' => 'completed']);
            InBodyRequest::where('trace_id', $retryItem->trace_id)->update(['status' => 'completed']);

            LogService::log(
                channel: 'ai',
                event: 'ai_retry_success',
                layer: 'retry',
                userId: $user->id,
                context: ['retry_item_id' => $retryItem->id, 'report_id' => $report->id ?? null]
            );

        } catch (\Throwable $e) {
            $isFinalFailure = ($retryItem->attempts_count >= 24);
            $newStatus = $isFinalFailure ? 'failed' : 'queued_for_retry';

            $retryItem->update(['status' => $newStatus]);
            InBodyRequest::where('trace_id', $retryItem->trace_id)->update(['status' => $newStatus]);

            $this->error("❌ Retry failed for user {$user->id}: {$e->getMessage()}");

            LogService::log(
                channel: 'ai',
                event: 'ai_retry_failed_attempt',
                layer: 'retry',
                status: 'failed',
                userId: $user->id,
                context: [
                    'retry_item_id' => $retryItem->id,
                    'error' => $e->getMessage(),
                    'final_failure' => $isFinalFailure,
                ]
            );

            if ($isFinalFailure) {
                LogService::error($e, ['retry_item_id' => $retryItem->id], 'retry');
            }
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function sanitizeAiData(array $data): array
    {
        $numericFields = ['weight', 'height', 'bmi', 'bmr', 'smm', 'pbf', 'body_fat_mass', 'water', 'protein', 'minerals'];

        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $val = (float) $data[$field];

                if (($field === 'pbf' || $field === 'body_fat_mass') && $val > 1000) {
                    $val = $val / 1000;
                }

                if ($field === 'bmr') {
                    $data[$field] = min($val, 999999.99);
                } else {
                    $data[$field] = min($val, 999.99);
                }
            }
        }

        return $data;
    }
}
