<?php
namespace App\Actions\Auth;

use App\Repositories\Auth\OtpRepository;
use App\Repositories\Auth\UserRepository;
use Illuminate\Validation\ValidationException;

class ResetPasswordAction
{
    public function __construct(protected OtpRepository $otpRepo, protected UserRepository $userRepo) {}

    public function execute(array $data)
    {
        $otpRecord = $this->otpRepo->isValidResetToken($data['email'], $data['token']);

        if (!$otpRecord) {
            throw ValidationException::withMessages(['token' => ['Invalid or expired reset session.']]);
        }

        $user = $this->userRepo->findByEmail($data['email']);

        if (!$user) {
        throw ValidationException::withMessages(['email' => ['User not found.']]);
    }

        $this->userRepo->updatePassword($user, $data['password']);

        $this->otpRepo->deleteOtp($otpRecord);
    }
}
