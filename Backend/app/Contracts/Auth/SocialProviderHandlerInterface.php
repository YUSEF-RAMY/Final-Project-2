<?php

namespace App\Contracts\Auth;

use App\DTOs\Auth\SocialUserDTO;

interface SocialProviderHandlerInterface
{
    /**
     * Get the redirect URL for the social provider.
     */
    public function getRedirectUrl(): string;

    /**
     * Retrieve the user data from the provider after callback and format as DTO.
     */
    public function getUser(): SocialUserDTO;
}
