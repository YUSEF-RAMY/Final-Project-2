<?php

use App\Services\Auth\Providers\FacebookProviderHandler;
use App\Services\Auth\Providers\GoogleProviderHandler;

return [
    /*
    |--------------------------------------------------------------------------
    | Social Authentication Providers
    |--------------------------------------------------------------------------
    |
    | This array registers the available social authentication providers.
    | To add a new provider, simply create a class implementing the
    | SocialProviderHandlerInterface and register it below.
    | No other code changes are needed (Open/Closed Principle).
    |
    */

    'providers' => [
        'google' => GoogleProviderHandler::class,
        'facebook' => FacebookProviderHandler::class,
    ],
];
