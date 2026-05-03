<?php

namespace App\Jobs\Inbody;

use App\Models\User;
use App\Notifications\Inbody\InBodyAnalyzedNotification;
use App\Services\Inbody\InBodyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInBodyAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $timeout = 150;
    public $tries = 1;

    public function __construct(protected User $user, protected string $imagePath) {}

    public function handle(InBodyService $inBodyService): void
    {
        try {
            logger('InBody Job Started');

            $result = $inBodyService->processInBodyImage($this->user, $this->imagePath);

            $this->user->notify(new InBodyAnalyzedNotification($result['report']));

            logger('Notification sent');
        } catch (\Exception $e) {
            logger('InBody Job Failed: ' . $e->getMessage());
        }
    }
}
