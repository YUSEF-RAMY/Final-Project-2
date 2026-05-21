<?php

namespace App\Services\Notifications;

use App\Repositories\NotificationRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\DatabaseNotification;

class NotificationService
{
    public function __construct(protected NotificationRepository $notificationRepository) {}

    /**
     * Get all notifications for the user.
     */
    public function getUserNotifications($user): Collection
    {
        return $this->notificationRepository->getUserNotifications($user);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($user, string $id): DatabaseNotification
    {
        $notification = $this->notificationRepository->findOrFailForUser($user, $id);
        $notification->markAsRead();

        return $notification;
    }

    /**
     * Clear all notifications for the user.
     */
    public function clearAll($user): int
    {
        return $this->notificationRepository->clearAllForUser($user);
    }

    /**
     * Delete a notification by ID for the user.
     */
    public function deleteNotificationById($user, string $id): bool
    {
        $notification = $this->notificationRepository->findOrFailForUser($user, $id);
        $notification->delete();

        return true;
    }

    /**
     * Mark all unread notifications as read for the user.
     */
    public function markAllAsRead($user): bool
    {
        $this->notificationRepository->markAllAsReadForUser($user);

        return true;
    }
}
