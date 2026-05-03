<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserDeviceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'fcm_token' => $this->fcm_token,
            'device_type' => $this->device_type,
            'created_at' => $this->created_at->format('Y-m-d h:i a'),
            'updated_at' => $this->updated_at->format('Y-m-d h:i a'),
        ];
    }
}
