<?php
namespace App\Services\Auth;

use App\Actions\Auth\LoginAction;
use App\Actions\Auth\RegisterAction;
use App\Actions\Auth\UpdatePasswordAction;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function registerUser(array $data)
    {
        $user = app(RegisterAction::class)->execute($data);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(array $credentials)
    {
        // استدعاء الأكشن
        [$user, $token] = app(LoginAction::class)->execute($credentials);

        return [
            'user' => new UserResource($user),
            'token' => $token,
        ];
    }

    public function logout($user)
    {
        $user->tokens()->delete();
        return true;
    }

    public function updatePassword(array $data)
    {
        $user = Auth::user(); // بنجيب اليوزر من التوكن

        app(UpdatePasswordAction::class)->execute($user, $data);

        return true;
    }
}
