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
            'height'          => $this->height,
            'weight'          => $this->weight,
            'age'             => $this->age,
            'gender'          => $this->gender,
            'muscle_mass'     => $this->smm,           // غيرنا الاسم ليكون أوضح للموبايل
            'body_fat_percentage (pbf)' => $this->pbf,
            'body_fat_mass'   => $this->body_fat_mass,
            'water'           => $this->water,
            'protein'         => $this->protein,
            'minerals'        => $this->minerals,
            'bmi'             => $this->bmi,
            'measured_at'     => $this->datetime?->format('Y-m-d H:i'), // تنسيق التاريخ
            'inbody_image'       => asset('storage/' . $this->report_image), // رابط مباشر للصورة
            // 'created_at'      => $this->created_at->diffForHumans(),     // "منذ ساعتين" مثلاً
        ];
    }
}
