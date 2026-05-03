<?php

namespace App\Http\Controllers\Api\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Notifications\RegisterDeviceRequest;
use App\Http\Resources\Notifications\UserDeviceResource;
use App\Services\Notifications\FcmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function __construct(protected FcmService $fcmService) {}

    /**
     * Register a new device token for the authenticated user.
     */
    public function register(RegisterDeviceRequest $request): JsonResponse
    {
        $device = $this->fcmService->updateDeviceToken(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Device registered successfully.',
            'data' => new UserDeviceResource($device),
        ]);
    }

    /**
     * List all devices for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $devices = $this->fcmService->getUserDevices($request->user());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Devices retrieved successfully.', 
            'data' => UserDeviceResource::collection($devices),
        ]);
    }

    /**
     * Update an existing device token.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'old_token' => 'nullable|string',
            'new_token' => 'required|string',
            'device_type' => 'required|in:android,ios,web',
        ]);

        $device = $this->fcmService->updateToken($request->user(), $request->only(['old_token', 'new_token', 'device_type']));

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Device token updated successfully.',
            'data' => new UserDeviceResource($device),
        ]);
    }

    /**
     * Unregister a device token.
     */
    public function unregister(Request $request): JsonResponse
    {
        // Support token from body or query string (useful for DELETE requests)
        $token = $request->input('fcm_token') ?? $request->query('fcm_token');

        if (! $token) {
            return response()->json([
                'status' => 'error',
                'status_code' => 422,
                'message' => 'The fcm_token field is required.',
            ], 422);
        }

        $deleted = $this->fcmService->removeDeviceToken(
            $request->user(),
            $token
        );

        if (! $deleted) {
            return response()->json([
                'status' => 'error',
                'status_code' => 404,
                'message' => 'Device not found or already unregistered for this user.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Device unregistered successfully.',
        ]);
    }
}
