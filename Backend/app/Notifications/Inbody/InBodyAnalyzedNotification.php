<?php

namespace App\Notifications\Inbody;

use App\Jobs\Middleware\JobLoggingMiddleware;
use App\Models\Body_report;
use App\Services\LogService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class InBodyAnalyzedNotification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [10, 30, 60];

    public ?string $trace_id = null;

    public function __construct(protected Body_report $report, ?string $trace_id = null)
    {
        $this->trace_id = $trace_id ?? (app()->bound('trace_id') ? app('trace_id') : null);
    }

    public function middleware()
    {
        return [new JobLoggingMiddleware];
    }

    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database', 'mail'];
    }

    private function payload(): array
    {
        $reportId = $this->report->id ?? $this->report->getKey();

        return [
            'inbody_report_id' => $reportId ? (string) $reportId : 'unknown',
            'type' => 'inbody_analysis',
        ];
    }

    public function toFcm($notifiable): ?FcmMessage
    {
        try {
            LogService::log(
                channel: 'notifications',
                event: 'building_fcm_notification',
                layer: 'notification',
                userId: $notifiable->id,
                context: ['report_id' => $this->report->id, 'trace_id' => $this->trace_id]
            );

            return FcmMessage::create()
                ->data($this->payload())
                ->notification(
                    FcmNotification::create()
                        ->title('InBody analysis completed! 🎉')
                        ->body('Your new numbers are ready, open the app to see your calories and macros.'),
                );
        } catch (\Throwable $e) {
            LogService::error($e, ['notifiable_id' => $notifiable->id, 'report_id' => $this->report->id], 'notification');

            return null;
        }
    }

    public function toArray(object $notifiable): array
    {
        try {
            return $this->payload() + [
                'title' => 'InBody analysis completed! 🎉',
                'message' => 'Your new numbers are ready, open the app to see your calories and macros.',
            ];
        } catch (\Throwable $e) {
            LogService::error($e, ['notifiable_id' => $notifiable->id], 'notification');

            return [
                'error' => 'Failed to build notification payload',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    public function toMail(object $notifiable): ?MailMessage
    {
        try {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return (new MailMessage)
                ->subject('تم الانتهاء من تحليل InBody! 🎉')
                ->greeting('مرحباً '.$notifiable->name.'!')
                ->line('لقد انتهينا من تحليل بيانات InBody الخاصة بك، وتم تحديث السعرات الحرارية والماكروز بناءً على النتيجة الجديدة.')
                ->action('عرض التفاصيل', $frontendUrl . '/dashboard')
                ->line('شكراً لاستخدامك تطبيق Healthify!');
        } catch (\Throwable $e) {
            LogService::error($e, ['notifiable_id' => $notifiable->id], 'notification');

            return null;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        LogService::log(
            channel: 'notifications',
            event: 'notification_failed',
            layer: 'notification',
            status: 'failed',
            userId: $this->report->user_id,
            context: [
                'notification' => static::class,
                'error' => $exception->getMessage(),
                'trace_id' => $this->trace_id,
            ]
        );

        LogService::error($exception, ['notification' => static::class, 'report_id' => $this->report->id], 'notification');
    }
}
