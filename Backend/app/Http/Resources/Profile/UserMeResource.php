<?php

namespace App\Http\Resources\Profile;

use App\Http\Resources\Inbody\BodyReportResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserMeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_image' => $this->profile_image ? asset('storage/'.$this->profile_image) : null,

            // Physical Profile Details
            'physical_profile' => new UserProfileResource($this->profile),

            // Nutritional Targets
            'nutritional_targets' => [
                'calories' => $this->target?->daily_calories,
                'protein' => $this->target?->target_protein,
                'carbs' => $this->target?->target_carbs,
                'fats' => $this->target?->target_fats,
            ],

            // Latest Body Composition (InBody)
            'latest_body_report' => $this->when($this->body_report()->exists(), function () {
                return new BodyReportResource($this->body_report()->latest()->first());
            }),

            'created_at' => $this->created_at->format('Y-m-d h:i A'),
        ];
    }
}
