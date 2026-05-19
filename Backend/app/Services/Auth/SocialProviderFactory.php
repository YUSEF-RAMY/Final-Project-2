<?php

namespace App\Services\Auth;

use App\Contracts\Auth\SocialProviderFactoryInterface;
use App\Contracts\Auth\SocialProviderHandlerInterface;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

class SocialProviderFactory implements SocialProviderFactoryInterface
{
    public function __construct(public Container $container) {}

    public function make(string $provider): SocialProviderHandlerInterface
    {
        $providers = config('social_auth.providers', []);

        if (! array_key_exists($provider, $providers)) {
            throw new InvalidArgumentException("Unsupported social provider: {$provider}");
        }

        return $this->container->make($providers[$provider]);
    }
}
