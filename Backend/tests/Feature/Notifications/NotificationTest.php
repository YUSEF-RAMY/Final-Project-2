<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

test('authenticated user can retrieve notifications', function () {
    // Create database notification using standard Laravel notification table attributes
    DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'Test Notification', 'message' => 'This is a test notification.'],
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/notifications');

    $response->assertStatus(200)
        ->assertJsonPath('status', 'success')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Test Notification')
        ->assertJsonPath('data.0.is_read', false);
});

test('user can mark a notification as read', function () {
    $notification = DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'Test', 'message' => 'Test Body'],
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/notifications/read', [
        'notification_id' => $notification->id,
    ]);

    $response->assertStatus(200);
    $this->assertNotNull($notification->refresh()->read_at);
});

test('user can mark all notifications as read', function () {
    DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'N1', 'message' => 'N1 body'],
    ]);

    DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'N2', 'message' => 'N2 body'],
    ]);

    $response = $this->actingAs($this->user)->postJson('/api/notifications/read-all');

    $response->assertStatus(200)
        ->assertJsonPath('meta.unread_count', 0);

    $this->assertEquals(0, $this->user->unreadNotifications()->count());
});

test('user can delete their own notification by id', function () {
    $notification = DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'N', 'message' => 'N body'],
    ]);

    $response = $this->actingAs($this->user)->deleteJson("/api/notifications/{$notification->id}");

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Notification deleted successfully.');

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

test('user cannot delete another users notification by id', function () {
    $notificationOfOtherUser = DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->otherUser->id,
        'data' => ['title' => 'Secret', 'message' => 'Secret message'],
    ]);

    $response = $this->actingAs($this->user)->deleteJson("/api/notifications/{$notificationOfOtherUser->id}");

    // Should return 404 Model Not Found because we scope query to $user->notifications()
    $response->assertStatus(404)
        ->assertJson([
            'status' => 'failed',
            'status_code' => 404,
            'message' => 'Notification not found.',
        ]);

    $this->assertDatabaseHas('notifications', ['id' => $notificationOfOtherUser->id]);
});

test('user can clear all notifications', function () {
    DatabaseNotification::create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $this->user->id,
        'data' => ['title' => 'N1', 'message' => 'N1 body'],
    ]);

    $response = $this->actingAs($this->user)->deleteJson('/api/notifications/clear-all');

    $response->assertStatus(200);
    $this->assertEquals(0, $this->user->notifications()->count());
});
