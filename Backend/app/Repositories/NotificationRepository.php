<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\DatabaseNotification;

class NotificationRepository
{
    /**
     * Get all notifications for the given user.
     */
    public function getUserNotifications($user): Collection
    {
        return $user->notifications()->get();
    }

    /**
     * Find a specific notification by ID for the given user or throw exception.
     */
    public function findOrFailForUser($user, string $id): DatabaseNotification
    {
        return $user->notifications()->findOrFail($id);
    }

    /**
     * Mark all unread notifications as read for the given user.
     */
    public function markAllAsReadForUser($user): int
    {
        return $user->unreadNotifications()->update(['read_at' => now()]);
    }

    /**
     * Clear (delete) all notifications for the given user.
     */
    public function clearAllForUser($user): int
    {
        return $user->notifications()->delete();
    }
}
