<?php

use App\Http\Middleware\TraceIdMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Force override of incorrect Firebase path in .env that cannot be edited due to root permissions
$firebasePath = dirname(__DIR__).'/storage/app/private/firebase/healthyfy-a3314-firebase-adminsdk-fbsvc-f5814396b1.json';
putenv("FIREBASE_CREDENTIALS=$firebasePath");
$_ENV['FIREBASE_CREDENTIALS'] = $firebasePath;
$_SERVER['FIREBASE_CREDENTIALS'] = $firebasePath;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register TraceIdMiddleware globally to ensure every request has a trace_id
        $middleware->prepend(TraceIdMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
