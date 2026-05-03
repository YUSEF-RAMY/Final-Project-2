<?php

namespace App\Http\Resources\Profile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'age' => (int) $this->age,
            'height' => (float) $this->height,
            'weight' => (float) $this->weight,
            'gender' => $this->gender,
            'activity_level' => $this->activity_level,
            'primary_objective' => $this->primary_objective,
            'medical_conditions' => $this->medical_conditions,

            'last_updated' => $this->updated_at->format('Y-m-d h:i A'),
        ];
    }
}
