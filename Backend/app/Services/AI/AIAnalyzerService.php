<?php

namespace App\Services\AI;

use App\Models\Body_report;
use Illuminate\Support\Facades\Http;

class AIAnalyzerService
{
    /**
     * Send InBody image to AI model
     */
    public function analyzeImage(string $path, int $userId)
    {
        // استخدم المسار الكامل عشان Http attach يشوف الملف
        $fullPath = storage_path('app/public/'.$path);

        $response = Http::attach(
            'image',
            file_get_contents($fullPath),
            'report.jpg'
        )->post(config('services.ai.url').'/analyze-inbody');

        if (! $response->successful()) {
            throw new \Exception('AI service failed to analyze image');
        }

        $data = $response->json();

        // بنخزن مرة واحدة بس هنا
        return Body_report::create([
            'user_id' => $userId,
            'report_image' => $path,
            'weight' => $data['weight'] ?? null,
            'bmi' => $data['bmi'] ?? null,
            'body_fat' => $data['body_fat'] ?? null,
            'muscle_mass' => $data['muscle_mass'] ?? null,
            'water_percentage' => $data['water_percentage'] ?? null,
            'protein_mass' => $data['protein_mass'] ?? null,
            'visceral_fat' => $data['visceral_fat'] ?? null,
            'bmr' => $data['bmr'] ?? null,
        ]);
    }

    /**
     * Save manual body report
     */
    public function manual(array $data, int $userId)
    {

        return Body_report::create([

            'user_id' => $userId,

            'weight' => $data['weight'] ?? null,
            'bmi' => $data['bmi'] ?? null,
            'body_fat' => $data['body_fat'] ?? null,
            'muscle_mass' => $data['muscle_mass'] ?? null,
            'water_percentage' => $data['water_percentage'] ?? null,
            'protein_mass' => $data['protein_mass'] ?? null,
            'visceral_fat' => $data['visceral_fat'] ?? null,
            'bmr' => $data['bmr'] ?? null,
        ]);
    }
}
