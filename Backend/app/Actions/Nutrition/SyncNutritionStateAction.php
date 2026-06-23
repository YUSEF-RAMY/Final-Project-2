<?php

namespace App\Actions\Nutrition;

use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Models\Body_report;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserTarget;
use App\Services\Nutrition\NutritionCalculatorService;

class SyncNutritionStateAction
{
    public function __construct(
        protected NutritionCalculatorService $calculator
    ) {}

    public function execute(User $user, NutritionAnalysisInputDTO $input): Body_report
    {
        // 1. Update User Profile (Latest Snapshot)
        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'age' => $input->age,
                'height' => $input->height,
                'weight' => $input->weight,
                'gender' => $input->gender,
                'activity_level' => $input->activityLevel->value,
                'primary_objective' => $input->primaryObjective->value,
                'medical_conditions' => $input->medicalConditions,
            ]
        );

        // 2. Create Body Report Record (Historical tracking)
        $report = Body_report::create(array_merge([
            'user_id' => $user->id,
            'height' => $input->height,
            'weight' => $input->weight,
            'age' => $input->age,
            'bmi' => $input->bmi,
            'bmr' => $input->bmr,
            'gender' => $input->gender,
            'measured_at' => now(),
            'datetime' => now(),
        ], $input->inBodyData));

        // 3. Calculate New Targets or use AI targets
        if (isset($input->inBodyData['calories'], $input->inBodyData['target_protein'])) {
            $results = [
                'daily_calories' => $input->inBodyData['calories'],
                'target_protein' => $input->inBodyData['target_protein'],
                'target_carbs' => $input->inBodyData['target_carbs'],
                'target_fats' => $input->inBodyData['target_fats'],
            ];
        } else {
            $results = $this->calculator->calculate($input);
        }

        // 4. Update User Targets
        UserTarget::updateOrCreate(
            ['user_id' => $user->id],
            [
                'daily_calories' => $results['daily_calories'],
                'target_protein' => $results['target_protein'],
                'target_carbs' => $results['target_carbs'],
                'target_fats' => $results['target_fats'],
            ]
        );

        // 5. Update the report with calculated macro targets and TDEE
        $report->update([
            'tdee' => $results['tdee'] ?? null,
            'calories' => $results['daily_calories'],
            'target_protein' => $results['target_protein'],
            'target_carbs' => $results['target_carbs'],
            'target_fats' => $results['target_fats'],
        ]);

        return $report;
    }
}
