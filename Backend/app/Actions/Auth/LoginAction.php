<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Repositories\Auth\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginAction
{
    public function __construct(protected UserRepository $userRepo) {}
    
    public function execute(array $credentials)
    {
        $user = $this->userRepo->findByEmail($credentials['email']);

        // 2. التحقق من الباسورد
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [$user, $token];
    }
}