<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\SocialAuthServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    SocialAuthServiceProvider::class,
];
