<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            
            // إضافة الحالة (Role) عشان الفرونت إند يعرف يعرض إيه
            'role'       => $this->role ?? 'user', 
            
            // تنسيق التاريخ بشكل Readable للـ Mobile/Web
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            
            // لو عندك علاقة مع الـ Profile (مثلاً في مشروع التغذية)
            // 'profile' => new PatientProfileResource($this->whenLoaded('profile')),
        ];
    }
}
