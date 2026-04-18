<?php

namespace App\Http\Controllers\Api\InBody;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inbody\InBodyRequest;
use App\Http\Resources\Inbody\BodyReportResource;
use App\Services\Inbody\InBodyService;
use Illuminate\Http\JsonResponse;

class InBodyController extends Controller
{
    public function __construct(protected InBodyService $inBodyService) {}

    public function analyze(InBodyRequest $request)
    {
        try {
            $result = $this->inBodyService->processInBodyImage($request->user(), $request->file('image'));

            return response()->json(
                [
                    'status' => 'success',
                    'status_code' => 200,
                    'message' => 'Analysis completed.',
                    'data' => [
                        // هنا السحر! الـ Resource هيشيل الـ id وكل الزيادات
                        'inbody_report' => new BodyReportResource($result['report']),

                        // لو عامل Resource للـ Targets استخدمه هنا برضه
                        'nutrition_targets' => [
                            'calories' => $result['targets']->daily_calories,
                            'protein' => $result['targets']->target_protein,
                            'carbs' => $result['targets']->target_carbs,
                            'fats' => $result['targets']->target_fats,
                        ],
                    ],
                ],
                200,
            );
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
