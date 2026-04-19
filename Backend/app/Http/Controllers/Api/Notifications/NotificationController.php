<?php

namespace App\Http\Controllers\Api\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Resources\Notifications\NotificationResource;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(protected NotificationService $notificationService) {}


    public function index(Request $request)
    {
        $notifications = $this->notificationService->getUserNotifications($request->user());
        return $this->standardResponse($request->user(), $notifications, 'Notifications retrieved successfully.');
    }


    public function markAsRead(Request $request)
    {
        $request->validate(['notification_id' => 'required|exists:notifications,id']);
        $this->notificationService->markAsRead($request->user(), $request->notification_id);
        
        return $this->index($request); 
    }


    public function clearAll(Request $request)
    {
        $this->notificationService->clearAll($request->user());
        return $this->standardResponse($request->user(), collect([]), 'All notifications cleared.');
    }

    /**
     * ميثود موحدة عشان الـ JSON يفضل ثابت في كل الـ Endpoints
     */
    private function standardResponse($user, $notifications, $message)
    {
        return response()->json([
            'status'      => 'success',
            'status_code' => 200,
            'message'     => $message,
            'meta'        => [
                'total_count'  => $user->notifications()->count(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
            'data'        => NotificationResource::collection($notifications),
        ], 200);
    }
}

