<?php

namespace App\Contracts\Auth;

interface SocialProviderFactoryInterface
{
    /**
     * Resolve the appropriate social provider handler.
     *
     * @throws \InvalidArgumentException
     */
    public function make(string $provider): SocialProviderHandlerInterface;
}
