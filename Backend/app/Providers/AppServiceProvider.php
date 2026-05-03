<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

// Events
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Failed;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Notifications\Events\NotificationFailed;

// Listeners
use App\Listeners\AuthListeners;
use App\Listeners\NotificationListeners;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerObservabilityListeners();
    }

    /**
     * Register listeners for distributed observability.
     */
    protected function registerObservabilityListeners(): void
    {
        // Auth Listeners
        Event::listen(Registered::class, [AuthListeners::class, 'handleUserRegistered']);
        Event::listen(Login::class, [AuthListeners::class, 'handleUserLoginSuccess']);
        Event::listen(Failed::class, [AuthListeners::class, 'handleUserLoginFailed']);

        // Notification Listeners
        Event::listen(NotificationSent::class, [NotificationListeners::class, 'handleNotificationSent']);
        Event::listen(NotificationFailed::class, [NotificationListeners::class, 'handleNotificationFailed']);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
