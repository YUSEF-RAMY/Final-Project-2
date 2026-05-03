<?php

namespace App\Services\Inbody;

use App\Actions\Plan\CalculateNutritionTargetsAction;
use App\Repositories\Inbody\InBodyRepository;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class InBodyService
{
    public function __construct(protected InBodyRepository $inBodyRepo, protected CalculateNutritionTargetsAction $calculateAction) {}

    public function processInBodyImage($user, $image)
    {
        $newPath = null;

        try {
            $imagePath = Storage::disk('public')->path($image);

            $stream = fopen($imagePath, 'r');

            $response = Http::timeout(120)
                ->attach('image', $stream, basename($imagePath))
                ->post(config('services.ai.url') . '/predict');

            fclose($stream);

            if (!$response->successful()) {
                throw new \Exception('AI Model error: ' . $response->body());
            }

            $data = $response->json();

            if (!isset($data['data'])) {
                throw new \Exception('Invalid AI response: ' . json_encode($data));
            }

            $aiData = $data['data'];

            // نقل الصورة
            $newPath = 'inbody_reports/' . basename($image);
            Storage::disk('public')->move($image, $newPath);

            // تخزين
            $report = $this->inBodyRepo->store(
                array_merge($aiData, [
                    'user_id' => $user->id,
                    'report_image' => $newPath,
                    'measured_at' => $aiData['datetime'],
                ]),
            );

            $targets = $this->calculateAction->execute($user, $aiData);

            return compact('report', 'targets');
        } catch (\Throwable $e) {
            if ($newPath && Storage::disk('public')->exists($newPath)) {
                Storage::disk('public')->delete($newPath);
            } elseif (Storage::disk('public')->exists($image)) {
                Storage::disk('public')->delete($image);
            }

            logger('InBody Job Failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function getLatestReport($user)
    {
        return $user->body_report()->latest()->first();
    }
}
