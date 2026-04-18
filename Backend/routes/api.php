<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Food\NutritionController;
use App\Http\Controllers\Api\Report\BodyReportController;
use Illuminate\Support\Facades\Route;




Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/nutrition-plan', [NutritionController::class, 'generate']);


    Route::post('/body-report/upload', [BodyReportController::class,'upload']);
    Route::post('/body-report/manual', [BodyReportController::class,'manual']);
});