<?php

use App\Modules\Business\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;

// Public (authenticated only — no tenant scope yet)
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('businesses', [BusinessController::class, 'index']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::get('businesses/{business}', [BusinessController::class, 'show']);
    Route::put('businesses/{business}', [BusinessController::class, 'update']);
    Route::delete('businesses/{business}', [BusinessController::class, 'destroy']);
    Route::post('businesses/{business}/switch', [BusinessController::class, 'switch']);
});
