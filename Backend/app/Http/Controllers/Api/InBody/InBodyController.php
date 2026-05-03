<?php

namespace App\Http\Controllers\Api\InBody;

use App\Actions\Nutrition\SyncNutritionStateAction;
use App\DTOs\InBody\NutritionAnalysisInputDTO;
use App\Enums\ActivityLevel;
use App\Enums\PrimaryObjective;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inbody\InBodyRequest as ValidationRequest;
use App\Http\Requests\Inbody\Manual\StoreManualProfileRequest;
use App\Http\Resources\Inbody\BodyReportResource;
use App\Http\Resources\Profile\UserProfileResource;
use App\Jobs\Inbody\ProcessInBodyAnalysis;
use App\Services\Inbody\InBodyService;
use App\Models\InBodyRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InBodyController extends Controller
{
    public function __construct(protected InBodyService $inBodyService) {}

    public function analyze(ValidationRequest $request)
    {
        try {
            $path = $request->file('image')->store('temp_inbody', 'public');
            $traceId = app('trace_id');

            // Initialize tracking record
            InBodyRequest::create([
                'user_id' => $request->user()->id,
                'trace_id' => $traceId,
                'image_path' => $path,
                'status' => 'processing'
            ]);

            $extraData = $request->only(['activity_level', 'primary_objective', 'medical_conditions']);

            ProcessInBodyAnalysis::dispatch($request->user(), $path, $extraData);

            return response()->json(
                [
                    'status' => 'processing',
                    'status_code' => 202,
                    'trace_id' => $traceId,
                    'message' => 'Your InBody analysis is being processed; we will notify you when it is ready.',
                ],
                202,
            );
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function checkStatus(Request $request, $traceId)
    {
        $inbodyRequest = InBodyRequest::where('trace_id', $traceId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => [
                'status' => $inbodyRequest->status,
                'created_at' => $inbodyRequest->created_at,
            ]
        ]);
    }

    public function storeManualEntry(StoreManualProfileRequest $request, SyncNutritionStateAction $syncAction)
    {
        $inputDto = NutritionAnalysisInputDTO::fromArray($request->validated());

        $syncAction->execute($request->user(), $inputDto);

        $profile = $request->user()->load('profile')->profile;

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => 'Profile metrics and goals updated successfully',
            'data' => new UserProfileResource($profile),
        ], 200);
    }

    public function updateGoals(Request $request, SyncNutritionStateAction $syncAction)
    {
        $validated = $request->validate([
            'primary_objective' => ['required', Rule::enum(PrimaryObjective::class)],
            'activity_level' => ['required', Rule::enum(ActivityLevel::class)],
            'medical_conditions' => 'nullable|string',
        ]);

        $profile = $request->user()->profile;

        if (! $profile) {
            return response()->json(['status' => 'error', 'message' => 'Profile not found. Please complete manual entry first.'], 422);
        }

        // Re-sync using existing profile metrics but new goals
        $inputDto = NutritionAnalysisInputDTO::fromArray(array_merge($profile->toArray(), $validated));

        $syncAction->execute($request->user(), $inputDto);

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => 'Goals updated and nutrition targets recalculated successfully',
            'data' => new UserProfileResource($request->user()->load('profile')->profile),
        ], 200);
    }

    public function getLatestReport(Request $request)
    {
        $report = $this->inBodyService->getLatestReport($request->user());

        if (! $report) {
            return response()->json([
                'status' => 'success',
                'status_code' => 200,
                'message' => 'No reports found.',
                'data' => [],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Latest report retrieved successfully.',
            'data' => new BodyReportResource($report),
        ]);
    }
}
