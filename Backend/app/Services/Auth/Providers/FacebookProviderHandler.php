<?php

namespace App\Services\Auth\Providers;

use App\Contracts\Auth\SocialProviderHandlerInterface;
use App\DTOs\Auth\SocialUserDTO;
use Laravel\Socialite\Facades\Socialite;

class FacebookProviderHandler implements SocialProviderHandlerInterface
{
    public const PROVIDER_NAME = 'facebook';

    public function getRedirectUrl(): string
    {
        return Socialite::driver(self::PROVIDER_NAME)
            ->stateless()
            ->scopes(['email'])
            ->redirect()
            ->getTargetUrl();
    }

    public function getUser(): SocialUserDTO
    {
        $request = request();

        // 1. Check for errors returned directly by Facebook (e.g. user cancelled, permission denied)
        if ($request->has('error')) {
            $errorCode = $request->query('error_code');
            $errorDescription = $request->query('error_description', $request->query('error_message', 'Unknown Facebook OAuth error'));
            throw new \RuntimeException("Facebook OAuth Error ({$errorCode}): {$errorDescription}");
        }

        // 2. Ensure authorization code is present
        if (! $request->has('code')) {
            throw new \InvalidArgumentException('Authorization code is missing from the Facebook callback request.');
        }

        // 3. Attempt to retrieve user using Socialite
        try {
            $socialiteUser = Socialite::driver(self::PROVIDER_NAME)
                ->stateless()
                ->user();
        } catch (\Throwable $e) {
            throw new \RuntimeException('Failed to authenticate with Facebook: '.$e->getMessage(), 0, $e);
        }

        // 4. Validate that email is not empty (e.g. phone-only accounts or scope denied)
        $email = $socialiteUser->getEmail();
        if (empty($email)) {
            throw new \RuntimeException('Unable to retrieve email address from your Facebook account. A verified email is required for registration.');
        }

        return new SocialUserDTO(
            providerName: self::PROVIDER_NAME,
            providerId: $socialiteUser->getId(),
            email: $email,
            name: $socialiteUser->getName(),
            phone: null,
            avatar: $socialiteUser->getAvatar(),
            token: $socialiteUser->token,
        );
    }
}
