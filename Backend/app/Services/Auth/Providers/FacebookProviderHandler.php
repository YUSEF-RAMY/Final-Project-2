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
            ->redirect()
            ->getTargetUrl();
    }

    public function getUser(): SocialUserDTO
    {
        $socialiteUser = Socialite::driver(self::PROVIDER_NAME)
            ->stateless()
            ->user();

        return new SocialUserDTO(
            providerName: self::PROVIDER_NAME,
            providerId: $socialiteUser->getId(),
            email: $socialiteUser->getEmail(),
            name: $socialiteUser->getName(),
            avatar: $socialiteUser->getAvatar(),
            token: $socialiteUser->token,
        );
    }
}
