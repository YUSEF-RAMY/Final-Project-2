<?php

namespace App\Jobs\Inbody;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Models\User;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\Inbody\InBodyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInBodyAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 150;

    public $tries = 1;

    public function __construct(protected User $user, protected string $imagePath, protected array $extraData) {}

    public function handle(InBodyService $inBodyService, SyncNutritionStateAction $syncAction): void
    {
        try {
            logger('InBody Job started for user: '.$this->user->id);

            $ocrResult = $inBodyService->processInBodyImage($this->user, $this->imagePath);
            $aiData = $ocrResult['ai_data'];

            // Map AI data to DTO (with defaults for safety)
            $inputDto = NutritionAnalysisInputDTO::fromArray([
                'weight' => $aiData['weight'] ?? $this->user->profile?->weight ?? 0,
                'height' => $aiData['height'] ?? $this->user->profile?->height ?? 0,
                'age' => $aiData['age'] ?? $this->user->profile?->age ?? 0,
                'gender' => $aiData['gender'] ?? $this->user->profile?->gender ?? 'male',
                'activity_level' => $this->extraData['activity_level'],
                'primary_objective' => $this->extraData['primary_objective'],
                'medical_conditions' => $this->extraData['medical_conditions'] ?? null,
                'inbody_data' => [
                    'report_image' => $ocrResult['image_path'],
                    'smm' => $aiData['smm'] ?? 0,
                    'pbf' => $aiData['pbf'] ?? 0,
                    'body_fat_mass' => $aiData['body_fat_mass'] ?? 0,
                    'bmi' => $aiData['bmi'] ?? 0,
                    'water' => $aiData['water'] ?? 0,
                    'protein' => $aiData['protein'] ?? 0,
                    'minerals' => $aiData['minerals'] ?? 0,
                ],
            ]);

            $syncAction->execute($this->user, $inputDto);

            // Notify user
            $report = $this->user->body_report()->latest()->first();
            $this->user->notify(new InBodyAnalyzedNotification($report));

            logger('InBody analysis completed successfully');
        } catch (\Exception $e) {
            logger('InBody Job Failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
        }
    }
}
