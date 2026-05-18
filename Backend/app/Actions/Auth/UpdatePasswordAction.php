<?php

namespace App\Actions\Auth;

use App\Repositories\Auth\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UpdatePasswordAction
{
    public function __construct(private UserRepository $userRepository) {}

    public function execute($user, array $data)
    {
        // 1. التأكد إن الباسورد الحالية (القديمة) صح
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['كلمة المرور الحالية غير صحيحة.'],
            ]);
        }

        // 2. تحديث الباسورد الجديدة بعد تشفيرها
        return $this->userRepository->updatePassword($user, $data['password']);
    }
}
