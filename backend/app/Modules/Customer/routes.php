<?php

use App\Modules\Customer\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::apiResource('customers', CustomerController::class);
});
