<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected  $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }
    public function register(RegisterRequest $request)
    {
        // هنا البيانات بتوصل "متفلترة" وجاهزة
        return $this->authService->register($request->validated());
    }

    public function login(LoginRequest $request)
    {
        return $this->authService->login($request->validated());
    }
    public function logout(Request $request)
    {
        return $this->authService->logout($request->user());
    }
}
