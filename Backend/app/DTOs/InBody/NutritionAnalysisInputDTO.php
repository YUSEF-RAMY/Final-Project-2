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
        public readonly string $gender,
        public readonly ActivityLevel $activityLevel,
        public readonly PrimaryObjective $primaryObjective,
        public readonly ?string $medicalConditions = null,
        public readonly ?array $inBodyData = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            weight: (float) $data['weight'],
            height: (float) $data['height'],
            age: (int) $data['age'],
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
