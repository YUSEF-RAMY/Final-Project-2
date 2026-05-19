<?php

namespace App\Http\Controllers\Api\Report;

use App\Http\Controllers\Controller;
use App\Services\AI\AIAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BodyReportController extends Controller
{
    public function upload(Request $request)
    {
        // 1. التأكد أن الملف موجود لتجنب الـ Error اللي ظهرلك
        if (! $request->hasFile('report')) {
            return response()->json(['message' => 'Please upload a report image'], 400);
        }

        // 2. رفع الملف
        $path = $request->file('report')->store('reports', 'public');

        $userId = Auth::id();
        $report = app(AIAnalyzerService::class)->analyzeImage($path, $userId);

        return response()->json($report, 201);
    }
}
