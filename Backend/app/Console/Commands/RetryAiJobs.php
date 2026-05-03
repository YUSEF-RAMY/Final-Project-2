<?php

namespace App\Console\Commands;

use App\Models\AiRetryQueue;
use App\Models\InBodyRequest;
use App\Jobs\Inbody\ProcessInBodyAnalysis;
use App\Services\Inbody\InBodyService;
use App\Actions\Nutrition\SyncNutritionStateAction;
use App\Services\LogService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class RetryAiJobs extends Command
{
    protected $signature = 'ai:retry-pending-jobs';
    protected $description = 'Retry failed AI analysis requests from the buffer table.';

    public function handle(InBodyService $inBodyService, SyncNutritionStateAction $syncAction)
    {
        $pendingJobs = AiRetryQueue::where('status', 'queued_for_retry')
            ->where('attempts_count', '<', 24)
            ->get();

        if ($pendingJobs->isEmpty()) {
            return;
        }

        foreach ($pendingJobs as $retryItem) {
            $this->processRetry($retryItem, $inBodyService, $syncAction);
        }
    }

    private function processRetry(AiRetryQueue $retryItem, InBodyService $inBodyService, SyncNutritionStateAction $syncAction)
    {
        app()->instance('trace_id', $retryItem->trace_id);

        LogService::log(
            channel: 'jobs',
            event: 'ai_retry_attempt_started',
            layer: 'retry',
            userId: $retryItem->user_id,
            context: ['retry_item_id' => $retryItem->id, 'attempt' => $retryItem->attempts_count + 1]
        );

        $retryItem->update([
            'status' => 'processing',
            'attempts_count' => $retryItem->attempts_count + 1,
            'last_attempt_at' => Carbon::now(),
        ]);

        try {
            $payload = $retryItem->payload;
            $job = new ProcessInBodyAnalysis($retryItem->user, $payload['imagePath'], $payload['extraData']);
            
            $job->executeAnalysisPipeline($inBodyService, $syncAction);

            // Update statuses
            $retryItem->update(['status' => 'completed']);
            InBodyRequest::where('trace_id', $retryItem->trace_id)->update(['status' => 'completed']);

            LogService::log(
                channel: 'ai',
                event: 'ai_retry_success',
                layer: 'retry',
                userId: $retryItem->user_id,
                context: ['retry_item_id' => $retryItem->id]
            );

        } catch (\Throwable $e) {
            $isFinalFailure = ($retryItem->attempts_count >= 24);
            $newStatus = $isFinalFailure ? 'failed' : 'queued_for_retry';
            
            $retryItem->update(['status' => $newStatus]);
            InBodyRequest::where('trace_id', $retryItem->trace_id)->update(['status' => $newStatus]);

            LogService::log(
                channel: 'ai',
                event: 'ai_retry_failed_attempt',
                layer: 'retry',
                status: 'failed',
                userId: $retryItem->user_id,
                context: [
                    'retry_item_id' => $retryItem->id,
                    'error' => $e->getMessage(),
                    'final_failure' => $isFinalFailure
                ]
            );

            if ($isFinalFailure) {
                LogService::error($e, ['retry_item_id' => $retryItem->id], 'retry');
            }
        }
    }
}
