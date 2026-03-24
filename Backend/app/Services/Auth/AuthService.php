<?php
namespace App\Services\Auth;

use App\Actions\Auth\RegisterAction;
use App\Actions\Auth\LoginAction;

class AuthService
{
    public function register(array $data)
    {
        // استدعاء الأكشن
        [$user, $token] = app(RegisterAction::class)->execute($data);

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(array $credentials)
    {
        [$user, $token] = app(LoginAction::class)->execute($credentials);

        return response()->json([
            'user' => $user,
            'access_token' => $token,
        ]);
    }

    public function logout($user)
    {
        $user->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}