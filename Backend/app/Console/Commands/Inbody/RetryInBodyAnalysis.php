<?php

namespace App\Console\Commands\Inbody;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\Models\AiRetryQueue;
use App\Models\User;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\InBodyService;
use App\Services\LogService;
use Illuminate\Console\Command;

class RetryInBodyAnalysis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inbody:retry-analysis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Retry failed InBody analysis requests stored in the persistent retry queue';

    /**
     * Execute the console command.
     */
    public function handle(InBodyService $inBodyService, SyncNutritionStateAction $syncAction): int
    {
        $queuedRequests = AiRetryQueue::where('status', 'queued_for_retry')
            ->where('attempts_count', '<', 5)
            ->limit(10)
            ->get();

        if ($queuedRequests->isEmpty()) {
            $this->info('No pending AI retry requests found.');

            return 0;
        }

        foreach ($queuedRequests as $retryRequest) {
            $this->processRetry($retryRequest, $inBodyService, $syncAction);
        }

        return 0;
    }

    private function processRetry(AiRetryQueue $retryRequest, InBodyService $inBodyService, SyncNutritionStateAction $syncAction): void
    {
        $payload = json_decode($retryRequest->payload, true);
        $imagePath = $payload['file_path'] ?? null;
        $traceId = $retryRequest->trace_id;
        $user = User::find($retryRequest->user_id);

        if (! $user || ! $imagePath) {
            $retryRequest->update(['status' => 'failed']);

            return;
        }

        // Set global trace ID for observability
        app()->instance('trace_id', $traceId);

        $retryRequest->update([
            'status' => 'processing',
            'last_attempt_at' => now(),
            'attempts_count' => $retryRequest->attempts_count + 1,
        ]);

        try {
            $this->info("Retrying analysis for user {$user->id} (Trace: {$traceId})");

            $analysisResult = $inBodyService->analyzeImage($imagePath);

            if (! $analysisResult || empty($analysisResult)) {
                throw new \Exception('AI service returned empty result during retry');
            }

            // Sync report and notify
            $report = $syncAction->execute($user, $analysisResult);

            if ($report && $report->exists) {
                $user->notify(new InBodyAnalyzedNotification($report, $traceId));

                $retryRequest->update(['status' => 'completed']);
                $this->info("Successfully processed retry for user {$user->id}");

                LogService::log(
                    channel: 'ai',
                    event: 'ai_retry_success',
                    layer: 'retry',
                    userId: $user->id,
                    context: ['trace_id' => $traceId, 'attempts' => $retryRequest->attempts_count]
                );
            }
        } catch (\Throwable $e) {
            $this->error("Retry failed for user {$user->id}: ".$e->getMessage());

            $retryRequest->update(['status' => 'queued_for_retry']);

            LogService::error($e, [
                'user_id' => $user->id,
                'trace_id' => $traceId,
                'attempts' => $retryRequest->attempts_count,
            ], 'retry');
        }
    }
}
