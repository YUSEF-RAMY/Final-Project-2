<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use App\Services\Notifications\FcmService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(protected FcmService $fcmService){}

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token'   => 'required|string',
            'device_type' => 'required|in:android,ios,web',
        ]);

        $this->fcmService->updateDeviceToken(
            $request->user(), 
            $request->only(['fcm_token', 'device_type'])
        );

        return response()->json([
            'status'      => 'success',
            'status_code' => 200,
            'message'     => 'FCM Token updated successfully.',
        ]);
    }
}
