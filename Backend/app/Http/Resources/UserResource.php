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
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_image' => $this->profile_image
                ? (filter_var($this->profile_image, FILTER_VALIDATE_URL) ? $this->profile_image : asset('storage/'.$this->profile_image))
                : null,
            'created_at' => $this->created_at->format('Y-m-d h:i:s A'),
            'updated_at' => $this->updated_at->format('Y-m-d h:i:s A'),
        ];
    }
}
