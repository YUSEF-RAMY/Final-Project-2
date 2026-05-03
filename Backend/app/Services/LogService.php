<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class LogService
{
    /**
     * Log a structured event.
     *
     * @param string $channel The domain channel (auth, jobs, ai, notifications)
     * @param string $event The event name (e.g., user_login_success)
     * @param string $layer The system layer (auth, job, ai, notification, retry)
     * @param string $status success|failed|pending
     * @param int|null $userId
     * @param string|null $jobId
     * @param int|null $durationMs
     * @param array $context Additional metadata
     * @return void
     */
    public static function log(
        string $channel,
        string $event,
        string $layer = 'job',
        string $status = 'success',
        ?int $userId = null,
        ?string $jobId = null,
        ?int $durationMs = null,
        array $context = []
    ): void {
        // Retrieve global trace_id from container
        $traceId = app()->bound('trace_id') ? app('trace_id') : 'system-internal';

        $structuredLog = [
            'trace_id' => $traceId,
            'event' => $event,
            'layer' => $layer,
            'status' => $status,
            'user_id' => $userId,
            'job_id' => $jobId,
            'duration_ms' => $durationMs,
            'context' => self::sanitize($context),
            'timestamp' => now()->toIso8601String(),
        ];

        // Route to specific channel
        Log::channel($channel)->info(json_encode($structuredLog));
    }

    /**
     * Centralized error logging.
     */
    public static function error(\Throwable $e, array $context = [], string $layer = 'job'): void
    {
        $traceId = app()->bound('trace_id') ? app('trace_id') : 'system-internal';

        Log::channel('errors')->error(json_encode([
            'trace_id' => $traceId,
            'event' => 'exception_thrown',
            'layer' => $layer,
            'status' => 'failed',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'context' => self::sanitize($context),
            'timestamp' => now()->toIso8601String(),
        ]));
    }

    /**
     * Sanitize sensitive data from context.
     */
    private static function sanitize(array $data): array
    {
        $sensitiveKeys = ['password', 'token', 'image', 'file_contents', 'binary'];

        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitiveKeys)) {
                $data[$key] = '[MASKED]';
            } elseif (is_array($value)) {
                $data[$key] = self::sanitize($value);
            }
        }

        return $data;
    }
}
