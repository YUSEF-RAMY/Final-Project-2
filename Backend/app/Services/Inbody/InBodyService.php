<?php

namespace App\Services\Inbody;

use App\Services\LogService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class InBodyService
{
    public function __construct() {}

    public function processInBodyImage($user, $image)
    {
        $startTime = Carbon::now();
        $traceId = app()->bound('trace_id') ? app('trace_id') : 'unknown';

        try {
            $imagePath = Storage::disk('public')->path($image);

            // Log file metadata (No binaries)
            LogService::log(
                channel: 'ai',
                event: 'image_processing_started',
                userId: $user->id,
                context: [
                    'file_name' => basename($image),
                    'file_size' => filesize($imagePath),
                    'mime_type' => mime_content_type($imagePath),
                ]
            );

            $stream = fopen($imagePath, 'r');

            // Log AI Request Sent
            LogService::log(
                channel: 'ai',
                event: 'ai_request_sent',
                userId: $user->id,
                context: ['endpoint' => '/predict']
            );

            $response = Http::timeout(240)
                ->withHeaders(['X-Trace-Id' => $traceId])
                ->attach('image', $stream, basename($imagePath))
                ->post(config('services.ai.url').'/predict');

            fclose($stream);

            $durationMs = (int) $startTime->diffInMilliseconds(Carbon::now());

            if (! $response->successful()) {
                LogService::log(
                    channel: 'ai',
                    event: 'ai_response_received',
                    status: 'failed',
                    userId: $user->id,
                    durationMs: $durationMs,
                    context: ['error' => $response->body()]
                );
                throw new \Exception('AI Model error: '.$response->body());
            }

            $data = $response->json();

            if (! isset($data['data'])) {
                throw new \Exception('Invalid AI response format');
            }

            $aiData = $data['data'];

            // Log AI Response Success with Summary
            LogService::log(
                channel: 'ai',
                event: 'ai_response_received',
                status: 'success',
                userId: $user->id,
                durationMs: $durationMs,
                context: [
                    'extracted_fields' => array_keys($aiData),
                ]
            );

            // Move image to permanent storage
            $newPath = 'inbody_reports/'.basename($image);
            Storage::disk('public')->move($image, $newPath);

            return [
                'ai_data' => $aiData,
                'image_path' => $newPath,
            ];

        } catch (\Throwable $e) {
            LogService::error($e, ['user_id' => $user->id, 'image' => $image]);
            throw $e;
        }
    }

    public function getLatestReport($user)
    {
        return $user->body_report()->latest()->first();
    }
}
