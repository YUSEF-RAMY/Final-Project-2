<?php

namespace App\Services\Notifications;

class NotificationService
{
    public function getUserNotifications($user)
    {
        return $user->notifications()->get();
    }

    public function markAsRead($user, $id)
    {
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $notification;
    }

    public function clearAll($user)
    {
        return $user->notifications()->delete();
    }
}
