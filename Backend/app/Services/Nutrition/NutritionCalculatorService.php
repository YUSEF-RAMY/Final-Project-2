<?php

namespace App\Services\Nutrition;

use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Enums\PrimaryObjective;

class NutritionCalculatorService
{
    public function calculate(NutritionAnalysisInputDTO $input): array
    {
        // 1. Use BMR from InBody if valid, otherwise calculate (Mifflin-St Jeor Equation)
        $bmr = $input->bmr;
        if (!$bmr || $bmr > 5000 || $bmr < 500) {
            $bmr = (10 * $input->weight) + (6.25 * $input->height) - (5 * $input->age);
            $bmr = $input->gender === 'male' ? $bmr + 5 : $bmr - 161;
        }

        // 2. Calculate TDEE
        $tdee = $bmr * $input->activityLevel->getMultiplier();

        // 3. Adjust calories based on objective
        $targetCalories = $tdee + $input->primaryObjective->getCalorieAdjustment();

        // 4. Calculate Macros
        // Standard split based on objective (can be more complex in future)
        $ratios = $this->getMacroRatios($input->primaryObjective);

        $protein = ($targetCalories * $ratios['protein']) / 4;
        $fats = ($targetCalories * $ratios['fats']) / 9;
        $carbs = ($targetCalories * $ratios['carbs']) / 4;

        return [
            'bmr' => round($bmr, 2),
            'tdee' => round($tdee, 2),
            'daily_calories' => round($targetCalories, 2),
            'target_protein' => round($protein, 2),
            'target_fats' => round($fats, 2),
            'target_carbs' => round($carbs, 2),
        ];
    }

    private function getMacroRatios($objective): array
    {
        return match ($objective) {
            PrimaryObjective::LOSE_WEIGHT => [
                'protein' => 0.40, // Higher protein for satiety and muscle preservation
                'fats' => 0.25,
                'carbs' => 0.35,
            ],
            PrimaryObjective::GAIN_WEIGHT, PrimaryObjective::BUILD_MUSCLE => [
                'protein' => 0.30,
                'fats' => 0.25,
                'carbs' => 0.45,
            ],
            default => [
                'protein' => 0.30,
                'fats' => 0.30,
                'carbs' => 0.40,
            ],
        };
    }
}
