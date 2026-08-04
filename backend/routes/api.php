<?php

use App\Modules\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function (): void {
    Route::middleware('throttle:auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('resend-verification', [AuthController::class, 'resendVerification'])
                ->middleware('throttle:6,1');
        Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed'])
            ->name('verification.verify');
    });
});
