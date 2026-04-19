<?php

namespace App\Notifications\Inbody;

use Illuminate\Bus\Queueable;
use App\Models\Body_report;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class InBodyAnalyzedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Body_report $report) {}

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database'];
    }

    private function payload(): array
    {
        return [
            'inbody_report_id' => (string) $this->report->id,
            'type' => 'inbody_analysis',
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        logger('Sending FCM to user: ' . $notifiable->id);
        return FcmMessage::create()
            ->setData($this->payload())
            ->setNotification(
                FcmNotification::create([
                    'title' => 'InBody analysis completed! 🎉',
                    'body' => 'Your new numbers are ready, open the app to see your calories and macros.',
                ]),
            );
    }

    public function toArray(object $notifiable): array
    {
        return $this->payload() + [
            'title' => 'InBody analysis completed! 🎉',
            'message' => 'Your new numbers are ready, open the app to see your calories and macros.',
        ];
    }
}
