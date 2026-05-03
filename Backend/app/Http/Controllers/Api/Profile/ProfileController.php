<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Profile\UserMeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's full profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'target', 'body_report' => function ($query) {
            $query->latest()->limit(1);
        }]);

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Profile retrieved successfully.',
            'data' => new UserMeResource($user),
        ]);
    }
}
