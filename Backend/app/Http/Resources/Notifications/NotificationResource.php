<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'notification_id' => $this->id,
            'title' => $this->data['title'] ?? 'إشعار جديد',
            'body' => $this->data['message'] ?? ($this->data['body'] ?? ''),
            'is_read' => ! is_null($this->read_at),
            'payload' => [
                'inbody_report_id' => $this->data['inbody_report_id'] ?? ($this->data['report_id'] ?? null),
            ],
            'created_at' => $this->created_at->diffForHumans(),
            'full_date' => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
