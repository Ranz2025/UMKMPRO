<?php

use App\Modules\Inventory\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Inventory Routes
|--------------------------------------------------------------------------
*/

Route::middleware('tenant')->prefix('v1/inventory')->group(function () {
    Route::get('movements', [InventoryController::class, 'movements']);
    Route::get('low-stock', [InventoryController::class, 'lowStock']);
    Route::post('adjust', [InventoryController::class, 'adjust']);
    Route::post('opname', [InventoryController::class, 'opname']);
});
