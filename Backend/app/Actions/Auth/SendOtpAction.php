<?php

namespace App\Actions\Auth;

use App\Services\Auth\OtpService;

class SendOtpAction
{
    public function __construct(protected OtpService $otpService) {}

    public function execute(array $data)
    {
        return $this->otpService->sendOtpCode($data['email']);
    }
}
