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

    /**
     * Calculate estimated InBody metrics based on basic inputs (Manual Entry)
     */
    public function calculateManualInBodyData(float $weight, float $heightCm, int $age, string $gender): array
    {
        $bmi = $this->calculateBMI($weight, $heightCm);
        $bmr = $this->calculateBMR($weight, $heightCm, $age, $gender);

        // Deurenberg Formula for Body Fat Percentage
        // PBF = (1.20 * BMI) + (0.23 * Age) - (10.8 * Gender) - 5.4
        $genderFactor = strtolower($gender) === 'male' ? 1 : 0;
        $pbf = (1.20 * $bmi) + (0.23 * $age) - (10.8 * $genderFactor) - 5.4;

        // Ensure PBF is within realistic bounds (e.g. 2% to 60%)
        $pbf = max(2, min(60, $pbf));

        $bodyFatMass = ($pbf / 100) * $weight;
        $lbm = $weight - $bodyFatMass; // Lean Body Mass

        // Approximate distributions of LBM
        $water = $lbm * 0.732;
        $protein = $lbm * 0.205;
        $minerals = $lbm * 0.063;

        $smm = $lbm * 0.57; // Skeletal Muscle Mass

        return [
            'bmi' => round($bmi, 2),
            'bmr' => round($bmr, 2),
            'pbf' => round($pbf, 2),
            'body_fat_mass' => round($bodyFatMass, 2),
            'lbm' => round($lbm, 2),
            'smm' => round($smm, 2),
            'water' => round($water, 2),
            'protein' => round($protein, 2),
            'minerals' => round($minerals, 2),
        ];
    }
}
