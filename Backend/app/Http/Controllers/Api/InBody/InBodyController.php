<?php

namespace App\Http\Controllers\Api\InBody;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inbody\InBodyRequest;
use App\Http\Resources\Inbody\BodyReportResource;
use App\Jobs\Inbody\ProcessInBodyAnalysis;
use App\Services\Inbody\InBodyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InBodyController extends Controller
{
    public function __construct(protected InBodyService $inBodyService) {}

    public function analyze(InBodyRequest $request)
    {
        try {
            $path = $request->file('image')->store('temp_inbody', 'public');

            ProcessInBodyAnalysis::dispatch($request->user(), $path);
            logger('dispatch ProcessInBodyAnalysis Is Done');

            // 3. الرد الفوري
            return response()->json(
                [
                    'status' => 'processing',
                    'status_code' => 202,
                    'message' => 'Your data is being analyzed; we will send you a notification as soon as it is finished.',
                ],
                202,
            );
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getLatestReport(Request $request)
    {
        $report = $this->inBodyService->getLatestReport($request->user());

        if (!$report) {
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
