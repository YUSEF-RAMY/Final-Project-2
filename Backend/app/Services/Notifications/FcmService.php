<?php

namespace App\Services\Notifications;

use App\Models\UserDevice;
use App\Notifications\General\TestPushNotification;

class FcmService
{
    public function updateDeviceToken($user, array $data)
    {
        return UserDevice::updateOrCreate(
            [
                'fcm_token' => $data['fcm_token'],
            ],
            [
                'user_id' => $user->id,
                'device_type' => $data['device_type'], // android or ios or web
            ]
        );
    }

    public function getUserDevices($user)
    {
        return UserDevice::where('user_id', $user->id)->get();
    }

    public function updateToken($user, array $data)
    {
        // Remove old token if provided
        if (! empty($data['old_token'])) {
            UserDevice::where('user_id', $user->id)
                ->where('fcm_token', $data['old_token'])
                ->delete();
        }

        return $this->updateDeviceToken($user, [
            'fcm_token' => $data['new_token'],
            'device_type' => $data['device_type'],
        ]);
    }

    public function removeDeviceToken($user, $fcmToken)
    {
        return UserDevice::where('user_id', $user->id)
            ->where('fcm_token', $fcmToken)
            ->delete();
    }

    public function sendTestNotification($user)
    {
        $user->notify(new TestPushNotification);
    }
}
