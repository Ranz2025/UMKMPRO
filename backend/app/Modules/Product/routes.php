<?php

use App\Modules\Product\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::apiResource('products', ProductController::class);

    // Endpoint kategori
    Route::get('categories', [\App\Modules\Product\Controllers\CategoryController::class, 'index']);
    Route::post('categories', [\App\Modules\Product\Controllers\CategoryController::class, 'store']);
    Route::put('categories/{id}', [\App\Modules\Product\Controllers\CategoryController::class, 'update']);
    Route::delete('categories/{id}', [\App\Modules\Product\Controllers\CategoryController::class, 'destroy']);
});
