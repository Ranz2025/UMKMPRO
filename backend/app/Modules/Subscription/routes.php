<?php

use App\Modules\Subscription\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Subscription & Billing Routes
|--------------------------------------------------------------------------
|
| /v1/plans              — Public: daftar plan tersedia
| /v1/subscription/*     — Protected: status, history, subscribe, cancel
|
*/

// Plan list — tidak butuh business context, hanya auth
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('plans', [SubscriptionController::class, 'plans']);
});

// Subscription management — butuh business context
// Dikecualikan dari CheckSubscription agar business expired tetap bisa upgrade
Route::middleware(['auth:sanctum', 'tenant.set', 'tenant.access'])->prefix('v1/subscription')->group(function () {
    Route::get('status', [SubscriptionController::class, 'status']);
    Route::get('history', [SubscriptionController::class, 'history']);
    Route::post('subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('cancel', [SubscriptionController::class, 'cancel']);
});
