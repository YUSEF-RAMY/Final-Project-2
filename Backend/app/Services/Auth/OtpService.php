<?php

namespace App\Services\Auth;

use App\Repositories\Auth\OtpRepository;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function __construct(protected OtpRepository $otpRepo) {}

    public function sendOtpCode(string $email)
    {
        $code = rand(100000, 999999);

        $this->otpRepo->updateOrCreateOtp($email, $code);

        Mail::to($email)->send(new OtpMail($code));
    }

    public function verifyOtp(string $email, string $code)
    {
        $otp = $this->otpRepo->findOtp($email, $code);

        if (!$otp) {
            throw ValidationException::withMessages(['code' => ['Invalid verification code.']]);
        }

        if ($otp->isExpired()) {
            $this->otpRepo->deleteOtp($otp);
            throw ValidationException::withMessages(['code' => ['Verification code has expired.']]);
        }

        return $this->otpRepo->markAsVerified($otp);
    }
}
