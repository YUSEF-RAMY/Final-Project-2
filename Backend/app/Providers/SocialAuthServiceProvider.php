<?php

namespace App\Providers;

use App\Contracts\Auth\SocialProviderFactoryInterface;
use App\Services\Auth\SocialProviderFactory;
use Illuminate\Support\ServiceProvider;

class SocialAuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(SocialProviderFactoryInterface::class, SocialProviderFactory::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
