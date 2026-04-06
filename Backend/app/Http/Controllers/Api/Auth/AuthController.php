<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Auth\ResetPasswordAction;
use App\Actions\Auth\SendOtpAction;
use App\Actions\Auth\VerifyOtpAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        // بننادي الـ Service اللي متعرفة في الـ constructor
        $result = $this->authService->registerUser($request->validated());

        return response()->json(
            [
                'status' => 'success',
                'status_code' => 201,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => new UserResource($result['user']),
                    'token' => $result['token'],
                    'token_type' => 'Bearer',
                ],
            ],
            201,
        );
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Logged in successfully',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => 'Bearer',
            ],
        ], 200);
    }
    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Logged out successfully',
        ], 200);
    }

    public function changePassword(UpdatePasswordRequest $request)
    {
        $this->authService->updatePassword($request->validated());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Password updated successfully',
        ], 200);
    }

    public function forgotPassword(ForgotPasswordRequest $request, SendOtpAction $action)
    {
        $action->execute($request->validated());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'OTP code sent to your email',
        ], 200);
    }

    public function verifyOtp(VerifyOtpRequest $request, VerifyOtpAction $action)
    {
        $token = $action->execute($request->validated());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'OTP verified successfully. You can now reset your password.',
            'token' => $token,
        ], 200);
    }

    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $action)
    {
        $action->execute($request->validated());

        return response()->json([
            'status' => 'success',
            'status_code' => 200,
            'message' => 'Password has been reset successfully. You can now login with your new password.',
        ], 200);
    }
}
