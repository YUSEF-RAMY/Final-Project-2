<?php

namespace App\Listeners;

use App\Services\LogService;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;

class AuthListeners
{
    public function handleUserRegistered(Registered $event)
    {
        LogService::log(
            channel: 'auth',
            event: 'user_registered',
            userId: $event->user->id,
            context: [
                'email' => $event->user->email,
                'ip_address' => request()->ip(),
            ]
        );
    }

    public function handleUserLoginSuccess(Login $event)
    {
        LogService::log(
            channel: 'auth',
            event: 'user_login_success',
            userId: $event->user->id,
            context: [
                'email' => $event->user->email,
                'ip_address' => request()->ip(),
            ]
        );
    }

    public function handleUserLoginFailed(Failed $event)
    {
        LogService::log(
            channel: 'auth',
            event: 'user_login_failed',
            status: 'failed',
            context: [
                'email' => $event->credentials['email'] ?? 'unknown',
                'ip_address' => request()->ip(),
            ]
        );
    }
}
