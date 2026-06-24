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
use App\Models\InBodyRequest;
use App\Services\Inbody\InBodyCalculationService;
use App\Services\Inbody\InBodyService;
use App\Services\MealTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;

class InBodyController extends Controller
{
    public function __construct(
        protected InBodyService $inBodyService,
        protected InBodyCalculationService $calculationService
    ) {}

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
                'status' => 'processing',
            ]);

            $extraData = $request->only(['activity_level', 'goal', 'fitness_level', 'disease_condition']);

            ProcessInBodyAnalysis::dispatch($request->user(), $path, $extraData);

            return response()->json(
                [
                    'status' => 'processing',
                    'status_code' => 202,
                    // 'trace_id' => $traceId,
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
            ],
        ]);
    }

    public function storeManualEntry(StoreManualProfileRequest $request, SyncNutritionStateAction $syncAction, MealTrackingService $mealService)
    {
        $data = $request->validated();

        $activityInput = $data['activity_level'] ?? 3;

        if (is_string($activityInput) && ActivityLevel::tryFrom($activityInput)) {
            $data['activity_level'] = ActivityLevel::from($activityInput);
        } else {
            $activityMap = [
                1 => ActivityLevel::SEDENTARY,
                2 => ActivityLevel::LIGHTLY_ACTIVE,
                3 => ActivityLevel::MODERATELY_ACTIVE,
                4 => ActivityLevel::VERY_ACTIVE,
                5 => ActivityLevel::EXTRA_ACTIVE,
            ];
            $data['activity_level'] = $activityMap[$activityInput] ?? ActivityLevel::MODERATELY_ACTIVE;
        }

        $goalMap = [
            'lose_fat' => PrimaryObjective::LOSE_WEIGHT,
            'lose_weight' => PrimaryObjective::LOSE_WEIGHT,
            'maintain' => PrimaryObjective::MAINTAIN,
            'gain_muscle' => PrimaryObjective::BUILD_MUSCLE,
            'build_muscle' => PrimaryObjective::BUILD_MUSCLE,
        ];
        $data['primary_objective'] = $goalMap[$data['goal'] ?? 'maintain'] ?? PrimaryObjective::MAINTAIN;
        $data['medical_conditions'] = $data['disease_condition'] ?? null;

        // Calculate BMI automatically
        $data['bmi'] = $this->calculationService->calculateBMI($data['weight'], $data['height']);

        // Calculate and simulate InBody Data
        $data['inbody_data'] = $this->calculationService->calculateManualInBodyData(
            $data['weight'],
            $data['height'],
            $data['age'],
            $data['gender']
        );

        $inputDto = NutritionAnalysisInputDTO::fromArray($data);

        $report = $syncAction->execute($request->user(), $inputDto);

        $profile = $request->user()->load('profile')->profile;

        $summary = $mealService->getDailySummary($request->user());

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => 'Profile metrics and goals updated successfully',
            'data' => [
                'profile' => new UserProfileResource($profile),
                'report' => new BodyReportResource($report),
                'daily_targets' => [
                    'calories' => $report->calories,
                    'protein' => $report->target_protein,
                    'carbs' => $report->target_carbs,
                    'fats' => $report->target_fats,
                ],
                'meal_distribution' => $summary['meal_targets'] ?? null,
            ],
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
        $history = $this->inBodyService->getHistory($request->user());
        $report = $history->first();
        $previous = $history->count() > 1 ? $history->get(1) : null;

        if (! $report) {
            return response()->json([
                'status' => 'success',
                'status_code' => 200,
                'message' => 'No reports found.',
                'data' => [],
            ]);
        }

        $data = (new BodyReportResource($report))->resolve();
        $data['previous_report'] = $previous ? (new BodyReportResource($previous))->resolve() : null;

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Latest report retrieved successfully.',
            'data' => $data,
        ]);
    }

    public function getHistory(Request $request)
    {
        $reports = $this->inBodyService->getHistory($request->user());

        if ($reports->isEmpty()) {
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
            'message' => 'History retrieved successfully.',
            'data' => BodyReportResource::collection($reports),
        ]);
    }

    public function classifyBodyType(Request $request)
    {
        $report = $request->user()->body_report()->latest()->firstOrFail();

        try {
            $response = Http::timeout(30)->post('https://heba15-body-classifier.hf.space/classify', [
                'height' => (float) ($report->height ?? 0),
                'weight' => (float) ($report->weight ?? 0),
                'age' => (int) ($report->age ?? 0),
                'gender' => strtolower($report->gender ?? 'male'),
                'pbf' => (float) ($report->pbf ?? 0),
                'smm' => (float) ($report->smm ?? 0),
                'body_fat_mass' => max(0.5, (float) ($report->body_fat_mass ?? 0.5)),
                'water' => (float) ($report->water ?? 0),
                'protein' => (float) ($report->protein ?? 0),
                'minerals' => (float) ($report->minerals ?? 0),
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to classify body type from ML service.',
                    'details' => $response->json(),
                ], 500);
            }

            $data = $response->json();

            $classification = $report->classification()->updateOrCreate(
                ['body_report_id' => $report->id],
                [
                    'category' => $data['category'] ?? null,
                    'reasoning' => $data['reasoning'] ?? null,
                    'metrics' => $data['metrics'] ?? null,
                    'disease_condition' => $request->user()->profile?->medical_conditions ?? 'healthy',
                ],
            );

            return response()->json([
                'status' => 'success',
                'status_code' => 200,
                'message' => 'Body type classified successfully.',
                'data' => [
                    'category' => $classification->category,
                    'reasoning' => $classification->reasoning,
                    'metrics' => $classification->metrics,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
