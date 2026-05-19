<?php

namespace App\Http\Controllers\Api\UserTarget;

use App\Http\Controllers\Controller;
use App\Services\UserTarget\UserTargetService;
use Illuminate\Http\Request;

class UserTargetController extends Controller
{
    public function __construct(protected UserTargetService $targetService) {}

    public function getDailyTarget(Request $request)
    {
        $target = $this->targetService->getUserDailyTarget($request->user());

        if (! $target) {
            return response()->json([
                'status' => 'error',
                'status_code' => 404,
                'message' => 'No targets found. Please analyze the InBody image first.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Daily targets retrieved successfully.',
            'data' => [
                'calories' => $target->daily_calories,
                'protein' => $target->target_protein,
                'carbs' => $target->target_carbs,
                'fats' => $target->target_fats,
                'updated_at' => $target->updated_at->diffForHumans(),
            ],
        ], 200);
    }
}
