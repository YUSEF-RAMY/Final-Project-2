<?php

namespace App\Actions\Plan;

use App\Models\UserTarget;

class CalculateNutritionTargetsAction
{
    public function execute($user, array $aiData)
    {
        $weight = $aiData['weight'];
        $height = $aiData['height'];
        $age    = $aiData['age'];
        $gender = $aiData['gender'];

        $bmr = (10 * $weight) + (6.25 * $height) - (5 * $age) + ($gender === 'male' ? 5 : -161);

        $tdee = $bmr * 1.375; 

        $targetCalories = $tdee - 500;

        // 4. تقسيم الماكروز (Protein 30%, Fats 25%, Carbs 45%)
        $protein = ($targetCalories * 0.30) / 4;
        $fats    = ($targetCalories * 0.25) / 9;
        $carbs   = ($targetCalories * 0.45) / 4;

        // 5. حفظ أو تحديث الأهداف في الداتابيز
        return UserTarget::updateOrCreate(
            ['user_id' => $user->id],
            [
                'daily_calories' => round($targetCalories, 2),
                'target_protein' => round($protein, 2),
                'target_carbs'   => round($carbs, 2),
                'target_fats'    => round($fats, 2),
            ]
        );
    }
}