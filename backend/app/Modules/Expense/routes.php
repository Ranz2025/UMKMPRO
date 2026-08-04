<?php

use App\Modules\Expense\Controllers\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1')->group(function () {
    Route::apiResource('expenses', ExpenseController::class);
});
