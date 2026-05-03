<?php
namespace App\Services\Notifications;

use App\Models\UserDevice;

class FcmService
{
    public function updateDeviceToken($user, array $data)
    {
        return UserDevice::updateOrCreate(
            [
                'user_id'     => $user->id,
                'device_type' => $data['device_type'], // android or ios or web
            ],
            [
                'fcm_token'   => $data['fcm_token'],
            ]
        );
    }

    public function removeDeviceToken($user, $fcmToken)
    {
        return UserDevice::where('user_id', $user->id)
            ->where('fcm_token', $fcmToken)
            ->delete();
    }
}