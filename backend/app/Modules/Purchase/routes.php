<?php

use App\Modules\Purchase\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::get('purchases', [PurchaseController::class, 'index']);
    Route::post('purchases', [PurchaseController::class, 'store']);
    Route::get('purchases/{id}', [PurchaseController::class, 'show']);
    Route::put('purchases/{id}', [PurchaseController::class, 'update']);
    Route::delete('purchases/{id}', [PurchaseController::class, 'destroy']);
});
