<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Food\NutritionController;
use App\Http\Controllers\Api\InBody\InBodyController;
use App\Http\Controllers\Api\MealController;
use App\Http\Controllers\Api\Notifications\DeviceController;
use App\Http\Controllers\Api\Notifications\NotificationController;
use App\Http\Controllers\Api\Profile\ProfileController;
use App\Http\Controllers\Api\UserTarget\UserTargetController;
use Illuminate\Support\Facades\Route;

// Group Auth Controller without middleware (register, login, forgot-password, verify-otp, reset-password)
Route::controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
    Route::post('/forgot-password', 'forgotPassword');
    Route::post('/verify-otp', 'verifyOtp');
    Route::post('/reset-password', 'resetPassword');
});

Route::middleware('auth:sanctum')->group(function () {
    // Group Auth Controller with middleware (auth:sanctum) => (logout, change-password)
    Route::controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout');
        Route::post('/change-password', 'changePassword');
    });

    // Group InBody (Data extraction from InBody , Get Latest Data)
    Route::prefix('inbody')
        ->controller(InBodyController::class)
        ->group(function () {
            Route::post('/analyze', 'analyze');

            Route::post('/manual', 'storeManualEntry');
            Route::post('/update-goals', 'updateGoals');

            Route::get('/latest', 'getLatestReport');
            Route::get('/status/{traceId}', 'checkStatus');
        });

    // Group Daily User Target
    Route::controller(UserTargetController::class)->group(function () {
        Route::get('/daily-target', 'getDailyTarget');
    });

    // Group FCM (firebase cloud tokens)
    Route::prefix('devices')
        ->controller(DeviceController::class)
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/register', 'register');
            Route::put('/update', 'update');
            Route::delete('/unregister', 'unregister');
        });

    Route::prefix('profile')
        ->controller(ProfileController::class)
        ->group(function () {
            Route::get('/', 'show');
        });

    // Group Notifications
    Route::prefix('notifications')
        ->controller(NotificationController::class)
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/read', 'markAsRead');
            Route::delete('/clear-all', 'clearAll');
        });

    // Group Food Tracking
    Route::prefix('foods')
        ->controller(MealController::class)
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/meals/{meal_type}/items', 'store');
            Route::delete('/meals/items/{id}', 'destroy');
            Route::get('/daily-summary', 'summary');
        });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/nutrition-plan', [NutritionController::class, 'generate']);
});
