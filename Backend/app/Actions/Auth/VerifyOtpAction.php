<?php
namespace App\Actions\Auth;

use App\Services\Auth\OtpService;

class VerifyOtpAction
{
    public function __construct(protected OtpService $otpService) {}

    public function execute(array $data)
    {
        return $this->otpService->verifyOtp($data['email'], $data['code']);
    }
}