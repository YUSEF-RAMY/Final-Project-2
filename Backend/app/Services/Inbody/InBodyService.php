<?php

namespace App\Services\Inbody;

use App\Actions\Plan\CalculateNutritionTargetsAction;
use App\Repositories\Inbody\InBodyRepository;
use Illuminate\Support\Facades\Http;

class InBodyService
{
    public function __construct(
        protected InBodyRepository $inBodyRepo,
        protected CalculateNutritionTargetsAction $calculateAction
    ) {}

    // App\Services\InBodyService.php

public function processInBodyImage($user, $image)
{
    $response = Http::timeout(120)->attach(
        'image', fopen($image, 'r'), $image->getClientOriginalName()
    )->post(config('services.ai.url') . '/predict');

    if (!$response->successful()) {
        throw new \Exception('AI Model error');
    }

    $aiData = $response->json()['data'];

    // حفظ التقرير
    $report = $this->inBodyRepo->store(array_merge($aiData, [
        'user_id' => $user->id,
        'report_image' => $image->store('inbody_reports', 'public'),
        'measured_at' => $aiData['datetime']
    ]));

    // حساب الأهداف
    $targets = $this->calculateAction->execute($user, $aiData);

    // بنرجع الـ Objects خام زي ما هي
    return [
        'report' => $report,
        'targets' => $targets
    ];
}
}