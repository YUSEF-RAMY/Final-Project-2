<?php

namespace App\Services\Inbody;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class InBodyService
{
    public function __construct() {}

    public function processInBodyImage($user, $image)
    {
        try {
            $imagePath = Storage::disk('public')->path($image);
            $stream = fopen($imagePath, 'r');

            $response = Http::timeout(120)
                ->attach('image', $stream, basename($imagePath))
                ->post(config('services.ai.url').'/predict');

            fclose($stream);

            if (! $response->successful()) {
                throw new \Exception('AI Model error: '.$response->body());
            }

            $data = $response->json();

            if (! isset($data['data'])) {
                throw new \Exception('Invalid AI response: '.json_encode($data));
            }

            $aiData = $data['data'];

            // Move image to permanent storage
            $newPath = 'inbody_reports/'.basename($image);
            Storage::disk('public')->move($image, $newPath);

            return [
                'ai_data' => $aiData,
                'image_path' => $newPath,
            ];

        } catch (\Throwable $e) {
            if (Storage::disk('public')->exists($image)) {
                Storage::disk('public')->delete($image);
            }
            logger('InBody OCR Failed', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    public function getLatestReport($user)
    {
        return $user->body_report()->latest()->first();
    }
}
