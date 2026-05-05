<?php

namespace App\Jobs\Middleware;

use App\Services\LogService;
use Closure;
use Illuminate\Support\Carbon;

class JobLoggingMiddleware
{
    /**
     * Process the queued job.
     *
     * @param  mixed  $job
     * @return mixed
     */
    public function handle($job, Closure $next)
    {
        // 1. Propagate Trace ID from job payload if available
        if (isset($job->trace_id)) {
            app()->instance('trace_id', $job->trace_id);
        } elseif (isset($job->notification->trace_id)) {
            app()->instance('trace_id', $job->notification->trace_id);
        }

        $startTime = Carbon::now();
        $jobId = method_exists($job, 'job') ? $job->job->getJobId() : 'unknown';

        // 2. Log Job Started
        LogService::log(
            channel: 'jobs',
            event: 'job_started',
            layer: 'job',
            userId: $job->user->id ?? null,
            jobId: $jobId,
            context: [
                'job_class' => get_class($job),
            ]
        );

        try {
            $result = $next($job);

            // 3. Log Job Completed
            LogService::log(
                channel: 'jobs',
                event: 'job_completed',
                layer: 'job',
                status: 'success',
                userId: $job->user->id ?? null,
                jobId: $jobId,
                durationMs: (int) $startTime->diffInMilliseconds(Carbon::now()),
                context: [
                    'job_class' => get_class($job),
                ]
            );

            return $result;
        } catch (\Throwable $e) {
            // 4. Log Job Failed
            LogService::log(
                channel: 'jobs',
                event: 'job_failed',
                layer: 'job',
                status: 'failed',
                userId: $job->user->id ?? null,
                jobId: $jobId,
                durationMs: (int) $startTime->diffInMilliseconds(Carbon::now()),
                context: [
                    'job_class' => get_class($job),
                    'error' => $e->getMessage(),
                ]
            );

            // Also log to errors channel
            LogService::error($e, ['job_id' => $jobId], 'job');

            throw $e;
        }
    }
}
