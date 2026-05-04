<?php

namespace App\Services\Inbody;

class InBodyCalculationService
{
    /**
     * Calculate BMI (Body Mass Index)
     * Formula: weight (kg) / (height (m) ^ 2)
     */
    public function calculateBMI(float $weight, float $heightCm): float
    {
        if ($heightCm <= 0) {
            return 0;
        }

        $heightMeters = $heightCm / 100;
        return round($weight / ($heightMeters * $heightMeters), 2);
    }

    /**
     * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
     */
    public function calculateBMR(float $weight, float $heightCm, int $age, string $gender): float
    {
        // Formula: (10 * weight) + (6.25 * height) - (5 * age)
        $bmr = (10 * $weight) + (6.25 * $heightCm) - (5 * $age);
        
        return $gender === 'male' ? $bmr + 5 : $bmr - 161;
    }
}
