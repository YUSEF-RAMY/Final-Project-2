<?php

namespace App\Http\Resources\Inbody;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BodyReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'height' => $this->height,
            'weight' => $this->weight,
            'age' => $this->age,
            'gender' => $this->gender,
            'muscle_mass' => $this->smm,           // غيرنا الاسم ليكون أوضح للموبايل
            'body_fat_percentage (pbf)' => $this->pbf,
            'body_fat_mass' => $this->body_fat_mass,
            'water' => $this->water,
            'protein' => $this->protein,
            'minerals' => $this->minerals,
            'bmi' => $this->bmi,
            'bmr' => $this->bmr,
            'visceral_fat_level' => $this->visceral_fat_level,
            'waist_hip_ratio' => $this->waist_hip_ratio,
            'trunk_fat_mass' => $this->trunk_fat_mass,
            'trunk_lean_mass' => $this->trunk_lean_mass,
            'inbody_score' => $this->inbody_score,
            'lbm' => $this->lbm,
            'tdee' => $this->tdee,
            'calories' => $this->calories,
            'target_protein' => $this->target_protein,
            'target_carbs' => $this->target_carbs,
            'target_fats' => $this->target_fats,
            'measured_at' => $this->datetime?->format('Y-m-d h:i A'),
            'created_at' => $this->created_at->format('Y-m-d h:i A'),
            'image' => $this->report_image ? asset('storage/'.$this->report_image) : null,
        ];
    }
}
