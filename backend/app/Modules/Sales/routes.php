<?php

use App\Modules\Sales\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::get('sales', [SaleController::class, 'index']);
    Route::post('sales', [SaleController::class, 'store'])->middleware('throttle:sales-pos');
    Route::get('sales/{id}', [SaleController::class, 'show']);
    Route::post('sales/{id}/cancel', [SaleController::class, 'cancel']);
});
