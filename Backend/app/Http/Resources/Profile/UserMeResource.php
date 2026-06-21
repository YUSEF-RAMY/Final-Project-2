<?php

namespace App\Http\Resources\Profile;

use App\Http\Resources\Inbody\BodyReportResource;
use App\Http\Resources\MealResource;
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
            'profile_image' => $this->profile_image
                ? (filter_var($this->profile_image, FILTER_VALIDATE_URL) ? $this->profile_image : asset('storage/'.$this->profile_image))
                : null,

            // Physical Profile Details
            'physical_profile' => new UserProfileResource($this->profile),

            // Nutritional Targets
            'nutritional_targets' => [
                'calories' => $this->target?->daily_calories,
                'protein' => $this->target?->target_protein,
                'carbs' => $this->target?->target_carbs,
                'fats' => $this->target?->target_fats,
            ],

            // Body Reports (InBody)
            'body_reports' => BodyReportResource::collection($this->whenLoaded('body_report')),
            
            // Latest Body Report
            'latest_body_report' => $this->whenLoaded('body_report', function() {
                $latest = $this->body_report->sortByDesc('created_at')->first();
                return $latest ? new BodyReportResource($latest) : null;
            }),

            // Meals
            'meals' => MealResource::collection($this->whenLoaded('meals')),

            // Meal Plans
            'meal_plans' => $this->whenLoaded('mealPlans'),

            // Linked Social Accounts
            'linked_social_accounts' => $this->whenLoaded('linkedSocialAccounts'),

            // Devices
            'devices' => $this->whenLoaded('devices'),

            'created_at' => $this->created_at->format('Y-m-d h:i A'),
        ];
    }
}
