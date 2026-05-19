<?php

namespace App\DTOs\Auth;

readonly class SocialUserDTO
{
    public function __construct(
        public string $providerName,
        public string $providerId,
        public string $email,
        public string $name,
        public ?string $phone = null,
        public ?string $avatar = null,
        public ?string $token = null,
    ) {}
}
