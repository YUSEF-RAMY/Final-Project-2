<?php

namespace App\Services;

use App\Models\Food;
use App\Models\Meal;
use App\Models\MealFood;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MealTrackingService
{
    /**
     * Add food to a specific meal.
     * Option A: Store as separate row to preserve history.
     */
    public function addFoodToMeal(User $user, int $foodId, string $mealType, float $quantity = 1, ?string $date = null): MealFood
    {
        $date = $date ?: Carbon::today()->toDateString();
        $food = Food::findOrFail($foodId);

        return DB::transaction(function () use ($user, $food, $mealType, $quantity, $date) {
            $meal = Meal::firstOrCreate([
                'user_id' => $user->id,
                'date' => $date,
                'type' => $mealType,
            ]);

            // No merging in DB to preserve entry history
            return MealFood::create([
                'meal_id' => $meal->id,
                'food_id' => $food->id,
                'quantity' => $quantity,
                'calories' => (float)$food->calories * $quantity,
                'protein' => (float)$food->protein * $quantity,
                'carbs' => (float)$food->carbs * $quantity,
                'fat' => (float)$food->fat * $quantity,
            ]);
        });
    }

    public function removeFoodFromMeal(int $mealFoodId): bool
    {
        $mealFood = MealFood::findOrFail($mealFoodId);
        return $mealFood->delete();
    }

    /**
     * Get optimized daily nutrition summary.
     */
    public function getDailySummary(User $user, ?string $date = null): array
    {
        $date = $date ?: Carbon::today()->toDateString();
        
        // Performance: Eager load meal targets and meals with items
        $user->loadMissing(['target', 'mealPlans']);
        $target = $user->target ?: $this->getDefaultTarget($user);
        
        $meals = Meal::where('user_id', $user->id)
            ->where('date', $date)
            ->with(['mealFoods.food']) // Eager load foods to avoid N+1
            ->get();

        $consumed = [
            'calories' => 0.0,
            'protein' => 0.0,
            'carbs' => 0.0,
            'fat' => 0.0,
        ];

        foreach ($meals as $meal) {
            foreach ($meal->mealFoods as $mealFood) {
                $consumed['calories'] += (float)$mealFood->calories;
                $consumed['protein'] += (float)$mealFood->protein;
                $consumed['carbs'] += (float)$mealFood->carbs;
                $consumed['fat'] += (float)$mealFood->fat;
            }
        }

        $remaining = [
            'calories' => max(0.0, (float)$target->daily_calories - $consumed['calories']),
            'protein' => max(0.0, (float)$target->target_protein - $consumed['protein']),
            'carbs' => max(0.0, (float)$target->target_carbs - $consumed['carbs']),
            'fat' => max(0.0, (float)$target->target_fats - $consumed['fat']),
        ];

        // Progress Indicators
        $caloriesPercentage = $target->daily_calories > 0 ? ($consumed['calories'] / $target->daily_calories) * 100 : 0;
        $proteinPercentage = $target->target_protein > 0 ? ($consumed['protein'] / $target->target_protein) * 100 : 0;

        $status = 'on_track';
        if ($caloriesPercentage > 105) {
            $status = 'over_target';
        } elseif ($caloriesPercentage < 90) {
            $status = 'under_target';
        }

        // Meal distribution logic (Enhanced with macros)
        $mealPlans = $user->mealPlans->keyBy('meal_type');
        $defaultDistribution = [
            'breakfast' => 30,
            'lunch' => 35,
            'dinner' => 25,
            'snacks' => 10,
        ];

        $mealDistributionTargets = [];
        $mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

        foreach ($mealTypes as $type) {
            $percentage = $mealPlans[$type]->percentage ?? $defaultDistribution[$type] ?? 0;
            $mealDistributionTargets[$type] = [
                'calories' => ($target->daily_calories * $percentage) / 100,
                'protein' => ($target->target_protein * $percentage) / 100,
                'carbs' => ($target->target_carbs * $percentage) / 100,
                'fat' => ($target->target_fats * $percentage) / 100,
            ];
        }

        $mealsWithMetrics = $meals->map(function ($meal) use ($mealDistributionTargets) {
            $mTarget = $mealDistributionTargets[$meal->type];
            $mConsumed = [
                'calories' => (float)$meal->mealFoods->sum('calories'),
                'protein' => (float)$meal->mealFoods->sum('protein'),
            ];

            $meal->metrics = [
                'consumed_calories' => $mConsumed['calories'],
                'target_calories' => $mTarget['calories'],
                'remaining_calories' => max(0.0, $mTarget['calories'] - $mConsumed['calories']),
                'consumed_protein' => $mConsumed['protein'],
                'target_protein' => $mTarget['protein'],
                'remaining_protein' => max(0.0, $mTarget['protein'] - $mConsumed['protein']),
            ];
            
            return $meal;
        });

        // Add empty meal structures for the UI
        $existingMealTypes = $mealsWithMetrics->pluck('type')->toArray();
        $finalMeals = $mealsWithMetrics->all();
        
        foreach ($mealTypes as $type) {
            if (!in_array($type, $existingMealTypes)) {
                $mTarget = $mealDistributionTargets[$type];
                $finalMeals[] = (object)[
                    'id' => null,
                    'type' => $type,
                    'date' => $date,
                    'mealFoods' => collect([]),
                    'metrics' => [
                        'consumed_calories' => 0.0,
                        'target_calories' => $mTarget['calories'],
                        'remaining_calories' => $mTarget['calories'],
                        'consumed_protein' => 0.0,
                        'target_protein' => $mTarget['protein'],
                        'remaining_protein' => $mTarget['protein'],
                    ],
                ];
            }
        }

        // Sort by type order
        usort($finalMeals, function($a, $b) use ($mealTypes) {
            return array_search($a->type, $mealTypes) <=> array_search($b->type, $mealTypes);
        });

        return [
            'overview' => [
                'target' => [
                    'calories' => (float)$target->daily_calories,
                    'protein' => (float)$target->target_protein,
                    'carbs' => (float)$target->target_carbs,
                    'fat' => (float)$target->target_fats,
                ],
                'consumed' => $consumed,
                'remaining' => $remaining,
                'progress' => [
                    'calories_percentage' => round($caloriesPercentage, 1),
                    'protein_percentage' => round($proteinPercentage, 1),
                ],
                'status' => $status,
            ],
            'meal_targets' => $mealDistributionTargets,
            'meals' => $finalMeals,
        ];
    }

    protected function getDefaultTarget(User $user)
    {
        return (object) [
            'daily_calories' => 2000,
            'target_protein' => 150,
            'target_carbs' => 250,
            'target_fats' => 70,
        ];
    }
}
