<?php

use App\Modules\Cash\Controllers\CashController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1/cash')->group(function () {
    Route::get('accounts', [CashController::class, 'getAccounts']);
    Route::post('accounts', [CashController::class, 'createAccount']);
    Route::get('transactions', [CashController::class, 'getTransactions']);
    Route::post('transactions', [CashController::class, 'createTransaction']);
});
