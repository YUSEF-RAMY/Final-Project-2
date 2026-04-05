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

        return response()->json(
            [
                'status' => 'success',
                'message' => 'User registered successfully',
                'data' => [
                    'user' => new UserResource($user),
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ],
            ],
            201,
        );
    }

    public function login(array $credentials)
    {
        // استدعاء الأكشن
        [$user, $token] = app(LoginAction::class)->execute($credentials);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل الدخول بنجاح',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function logout($user)
    {
        $user->tokens()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    public function updatePassword(array $data)
    {
        $user = Auth::user(); // بنجيب اليوزر من التوكن

        app(UpdatePasswordAction::class)->execute($user, $data);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تغيير كلمة المرور بنجاح',
        ]);
    }
}
