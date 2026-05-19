<?php

namespace App\DTOs\InBody;

use App\Enums\ActivityLevel;
use App\Enums\PrimaryObjective;

class NutritionAnalysisInputDTO
{
    public function __construct(
        public readonly float $weight,
        public readonly float $height,
        public readonly int $age,
        public readonly float $bmi,
        public readonly float $bmr,
        public readonly string $gender,
        public readonly ActivityLevel $activityLevel,
        public readonly PrimaryObjective $primaryObjective,
        public readonly ?string $medicalConditions = null,
        public readonly ?array $inBodyData = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $weight = (float) $data['weight'];
        $height = (float) $data['height'];

        // Calculate BMI if not provided
        $bmi = $data['bmi'] ?? 0;
        if (! $bmi && $height > 0) {
            $heightMeters = $height / 100;
            $bmi = round($weight / ($heightMeters * $heightMeters), 2);
        }

        // Calculate BMR if not provided
        $bmr = $data['bmr'] ?? 0;
        if (! $bmr) {
            $bmr = (10 * $weight) + (6.25 * $height) - (5 * (int) $data['age']);
            $bmr = $data['gender'] === 'male' ? $bmr + 5 : $bmr - 161;
        }

        return new self(
            weight: $weight,
            height: $height,
            age: (int) $data['age'],
            bmi: (float) $bmi,
            bmr: (float) $bmr,
            gender: $data['gender'],
            activityLevel: $data['activity_level'] instanceof ActivityLevel
                ? $data['activity_level']
                : ActivityLevel::from($data['activity_level']),
            primaryObjective: $data['primary_objective'] instanceof PrimaryObjective
                ? $data['primary_objective']
                : PrimaryObjective::from($data['primary_objective']),
            medicalConditions: $data['medical_conditions'] ?? null,
            inBodyData: $data['inbody_data'] ?? [],
        );
    }
}
