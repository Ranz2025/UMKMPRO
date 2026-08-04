<?php

use App\Modules\Supplier\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::apiResource('suppliers', SupplierController::class);
});
