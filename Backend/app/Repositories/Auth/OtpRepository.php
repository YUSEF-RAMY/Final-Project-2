<?php

namespace App\Repositories\Auth;

use App\Models\Otp;
use Carbon\Carbon;

class OtpRepository
{
    public function findOtp(string $email, string $code)
    {
        return Otp::where('identifier', $email)->where('code', $code)->first();
    }

    public function deleteOtp(Otp $otp)
    {
        return $otp->delete();
    }

    public function deleteByIdentifier(string $email)
    {
        return Otp::where('identifier', $email)->delete();
    }

    public function updateOrCreateOtp(string $email, string $code)
    {
        return Otp::updateOrCreate(
            ['identifier' => $email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ],
        );
    }

    public function markAsVerified(Otp $otp)
    {
        $token = bin2hex(random_bytes(32));

        $otp->update([
            'token' => $token,
            'verified_at' => now(),
        ]);

        return $token;
    }

    public function isValidResetToken(string $email, string $token)
    {
        return Otp::where('identifier', $email)
            ->where('token', $token)
            ->where('verified_at', '>=', now()->subMinutes(10))
            ->first();
    }
}
