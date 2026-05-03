<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FoodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image_url' => $this->image ? (filter_var($this->image, FILTER_VALIDATE_URL) ? $this->image : url($this->image)) : null,
            'category' => $this->category,
            'nutrition' => [
                'calories' => (float)$this->calories,
                'protein' => (float)$this->protein,
                'carbs' => (float)$this->carbs,
                'fat' => (float)$this->fat,
                'serving_size' => $this->serving_size,
            ],
        ];
    }
}
