<?php

namespace App\Actions\Plan;

use App\Models\Food;
use App\Services\AI\AIAnalyzerService;
use App\Services\Nutrition\MealPlanService;

class GenerateNutritionPlanAction
{
    public function __construct(
        private AIAnalyzerService $ai,

        private MealPlanService $mealPlanService,
    ) {}

    public function execute($data, $userID)
    {
        $nutrition = $this->ai->manual($data , $userID);

        $plan = $this->mealPlanService->generatePlan($nutrition);

        return [
            'nutrition' => $nutrition,

            'plan' => $plan,
        ];
    }

    public function generatePlan($nutrition)
    {
        $mealCalories = $nutrition['calories'] / 3;

        return Food::where('calories', '<=', $mealCalories)->inRandomOrder()->take(6)->get();
    }
}
