<?php

namespace App\Actions\Auth;

use App\DTOs\Auth\SocialUserDTO;
use App\Models\LinkedSocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HandleSocialLoginAction
{
    /**
     * Handle the social login/registration flow.
     *
     * @return array Returns the user instance and a generated API token.
     */
    public function execute(SocialUserDTO $socialUser): array
    {
        return DB::transaction(function () use ($socialUser) {
            $isNewUser = false;
            $linkedAccount = LinkedSocialAccount::query()
                ->where('provider_name', $socialUser->providerName)
                ->where('provider_id', $socialUser->providerId)
                ->first();

            if ($linkedAccount) {
                // User has logged in with this provider before
                $user = $linkedAccount->user;
            } else {
                // Find user by email or create a new one
                $user = User::query()->where('email', $socialUser->email)->first();

                if (! $user) {
                    $user = User::query()->create([
                        'name' => $socialUser->name,
                        'email' => $socialUser->email,
                        'phone' => $socialUser->phone,
                        'profile_image' => $socialUser->avatar,
                        'password' => bcrypt(Str::random(16)), // Fallback random password
                        'email_verified_at' => now(), // Social emails are verified by the provider
                    ]);
                    $isNewUser = true;
                }

                // Link the social account to the user
                $user->linkedSocialAccounts()->create([
                    'provider_name' => $socialUser->providerName,
                    'provider_id' => $socialUser->providerId,
                ]);
            }

            // Create a Sanctum token for the API
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
                'is_new_user' => $isNewUser,
            ];
        });
    }
}
