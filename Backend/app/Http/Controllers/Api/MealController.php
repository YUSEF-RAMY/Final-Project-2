<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailySummaryResource;
use App\Http\Resources\FoodResource;
use App\Models\Food;
use App\Services\MealTrackingService;
use Illuminate\Http\Request;

class MealController extends Controller
{
    public function __construct(protected MealTrackingService $mealTrackingService)
    {
    }

    /**
     * Get all foods for UI selection
     */
    public function index()
    {
        $foods = Food::all();
        return FoodResource::collection($foods);
    }

    /**
     * Add food to a specific meal
     */
    public function store(Request $request, string $mealType)
    {
        $validated = $request->validate([
            'food_id' => 'required|exists:foods,id',
            'quantity' => 'required|numeric|min:0.01',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        if (!in_array($mealType, ['breakfast', 'lunch', 'dinner', 'snacks'])) {
            return response()->json(['message' => 'Invalid meal type'], 422);
        }

        try {
            $mealFood = $this->mealTrackingService->addFoodToMeal(
                $request->user(),
                $validated['food_id'],
                $mealType,
                $validated['quantity'],
                $validated['date'] ?? null
            );

            return response()->json([
                'message' => 'Food added successfully',
                'data' => $mealFood
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to add food', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove food item from meal
     */
    public function destroy(int $id)
    {
        try {
            $this->mealTrackingService->removeFoodFromMeal($id);
            return response()->json(['message' => 'Item removed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Item not found or failed to delete'], 404);
        }
    }

    /**
     * Get daily nutrition summary
     */
    public function summary(Request $request)
    {
        $date = $request->query('date');
        $summary = $this->mealTrackingService->getDailySummary($request->user(), $date);

        return new DailySummaryResource($summary);
    }
}
