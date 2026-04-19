<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Food\NutritionController;
use App\Http\Controllers\Api\InBody\InBodyController;
use App\Http\Controllers\Api\Notifications\NotificationController;
use App\Http\Controllers\Api\Profile\ProfileController;
use App\Http\Controllers\Api\UserTarget\UserTargetController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout');
        Route::post('/change-password', 'changePassword');
        Route::post('/forgot-password', 'forgotPassword');
        Route::post('/verify-otp', 'verifyOtp');
        Route::post('/reset-password', 'resetPassword');
    });

    Route::prefix('inbody')->controller(InBodyController::class)->group(function () {
            Route::post('/analyze', 'analyze');
            Route::get('/latest', 'getLatestReport');
        });

    Route::controller(UserTargetController::class)->group(function () {
        Route::get('/daily-target', 'getDailyTarget');
    });

    Route::prefix('profile')->controller(ProfileController::class)->group(function () {
        Route::post('/fcm-token', 'updateFcmToken'); 
        // Route::get('/', 'show');
    });

    Route::prefix('notifications')->controller(NotificationController::class)->group(function () {
            Route::get('/', 'index');
            Route::post('/read', 'markAsRead');
            Route::delete('/clear-all', 'clearAll');
        });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/nutrition-plan', [NutritionController::class, 'generate']);
});
