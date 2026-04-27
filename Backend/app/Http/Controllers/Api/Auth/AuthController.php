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
        $result = $this->authService->registerUser($request->validated());
        return $this->sendResponse(
            [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => 'Bearer',
            ],
            'User registered successfully',
            201,
        );
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return $this->sendResponse(
            [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => 'Bearer',
            ],
            'Logged in successfully',
        );
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return $this->sendSuccess('Logged out successfully');
    }

    public function changePassword(UpdatePasswordRequest $request)
    {
        $this->authService->updatePassword($request->validated());

        return $this->sendSuccess('Password updated successfully');
    }

    public function forgotPassword(ForgotPasswordRequest $request, SendOtpAction $action)
    {
        $action->execute($request->validated());

        return $this->sendSuccess('OTP code sent to your email');
    }

    public function verifyOtp(VerifyOtpRequest $request, VerifyOtpAction $action)
    {
        $token = $action->execute($request->validated());

        return $this->sendResponse(
            [
                'token' => $token,
            ],
            'OTP verified successfully.',
        );
    }

    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $action)
    {
        $action->execute($request->validated());

        return $this->sendSuccess('Password has been reset successfully. You can now login with your new password.');
    }
}
