<?php

namespace App\Listeners;

use App\Services\LogService;
use Illuminate\Notifications\Events\NotificationFailed;
use Illuminate\Notifications\Events\NotificationSent;

class NotificationListeners
{
    public function handleNotificationSent(NotificationSent $event)
    {
        LogService::log(
            channel: 'notifications',
            event: 'notification_sent',
            userId: $event->notifiable->id ?? null,
            context: [
                'notification' => get_class($event->notification),
                'channel' => $event->channel,
                'response' => $event->response,
            ]
        );
    }

    public function handleNotificationFailed(NotificationFailed $event)
    {
        LogService::log(
            channel: 'notifications',
            event: 'notification_failed',
            status: 'failed',
            userId: $event->notifiable->id ?? null,
            context: [
                'notification' => get_class($event->notification),
                'channel' => $event->channel,
                'error' => $event->data['error'] ?? 'Unknown error',
            ]
        );
    }
}
