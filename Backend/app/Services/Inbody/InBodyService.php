<?php

namespace App\Services\Inbody;

use App\Services\LogService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class InBodyService
{
    public function processInBodyImage($user, $image, $extraData = [])
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

            $activityLevel = $extraData['activity_level'] ?? 3;
            $goal = $extraData['goal'] ?? 'maintain';
            $fitnessLevel = $extraData['fitness_level'] ?? 3;

            $disease = $extraData['disease_condition'] ?? 'healthy';
            if (empty(trim($disease))) {
                $disease = 'healthy';
            }

            $queryParams = http_build_query([
                'goal' => $goal,
                'activity_level' => $activityLevel,
                'fitness_level' => $fitnessLevel,
                'disease_condition' => $disease,
            ]);

            $response = Http::timeout(240)
                ->withHeaders(['X-Trace-Id' => $traceId])
                ->attach('file', $stream, basename($imagePath))
                ->post(config('services.ai.url').'/predict?'.$queryParams);

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

            if (! isset($data['inbody_data'])) {
                throw new \Exception('Invalid AI response format: Missing inbody_data');
            }

            $aiData = $this->normalizeAiResponse($data);

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

    /**
     * Normalize AI extractor response keys to match internal field conventions.
     *
     * @param  array<string, string>  $data  Raw response from the AI extractor
     * @return array<string, mixed>
     */
    private function normalizeAiResponse(array $data): array
    {
        $inbodyData = $data['inbody_data'] ?? [];

        // Flatten the response
        $flatData = array_merge($inbodyData, [
            'calories' => $data['calories'] ?? null,
            'target_protein' => $data['protein'] ?? null,
            'target_carbs' => $data['carbs'] ?? null,
            'target_fats' => $data['fat'] ?? null,
        ]);

        /** @var array<string, string> Map API field names → internal field names */
        $keyMap = [
            'muscle_mass' => 'smm',
            'body_fat_percentage' => 'pbf',
            'measured_at' => 'measured_at',
        ];

        $normalized = [];

        foreach ($flatData as $key => $value) {
            $normalizedKey = $keyMap[$key] ?? $key;
            $normalized[$normalizedKey] = $value;
        }

        // Convert height from meters to centimeters (API returns meters, app expects cm)
        if (isset($normalized['height'])) {
            $height = (float) $normalized['height'];
            if ($height < 3) {
                $normalized['height'] = round($height * 100, 2);
            }
        }

        // Normalize gender to lowercase
        if (isset($normalized['gender'])) {
            $normalized['gender'] = strtolower($normalized['gender']);
        }

        return $normalized;
    }

    public function getLatestReport($user)
    {
        return $user->body_report()->latest()->first();
    }
}
