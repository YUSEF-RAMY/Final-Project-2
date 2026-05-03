<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailySummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'overview' => $this['overview'],
            'meal_targets' => $this['meal_targets'],
            'meals' => MealResource::collection($this['meals']),
        ];
    }
}
