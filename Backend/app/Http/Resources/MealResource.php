<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MealResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Option A: Merge items by food_id for the response
        $mergedItems = $this->mealFoods->groupBy('food_id')->map(function ($items) {
            $first = $items->first();
            $food = $first->food;

            return [
                'food_id' => $first->food_id,
                'name' => $food->name ?? 'Unknown Food',
                'image_url' => $food ? ($food->image ? (filter_var($food->image, FILTER_VALIDATE_URL) ? $food->image : url($food->image)) : null) : null,
                'total_quantity' => (float) $items->sum('quantity'),
                'total_nutrition' => [
                    'calories' => (float) $items->sum('calories'),
                    'protein' => (float) $items->sum('protein'),
                    'carbs' => (float) $items->sum('carbs'),
                    'fat' => (float) $items->sum('fat'),
                ],
                // Return individual entries if needed for history
                'entries' => $items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => (float) $item->quantity,
                    'created_at' => $item->created_at ? $item->created_at->format('Y-m-d h:i A') : null,
                ]),
            ];
        })->values();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'date' => $this->date,
            'metrics' => $this->metrics ?? [
                'consumed_calories' => 0.0,
                'target_calories' => 0.0,
                'remaining_calories' => 0.0,
                'consumed_protein' => 0.0,
                'target_protein' => 0.0,
                'remaining_protein' => 0.0,
            ],
            'items' => $mergedItems,
        ];
    }
}
