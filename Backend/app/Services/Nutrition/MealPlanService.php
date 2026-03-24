<?php

namespace App\Services\Nutrition;

use App\Repositories\FoodRepository;

class MealPlanService
{

    public function __construct(
        private FoodRepository $foodRepository
    ){}

    public function generatePlan($nutrition)
    {

        $proteins = $this->foodRepository->getProteinFoods()->random(2);

        $carbs = $this->foodRepository->getCarbFoods()->random(2);

        $fats = $this->foodRepository->getFatFoods()->random(1);

        return [

            'breakfast'=>[$proteins[0],$carbs[0]],

            'lunch'=>[$proteins[1],$carbs[1]],

            'snack'=>[$fats[0]]

        ];

    }

}
