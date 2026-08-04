<?php

use App\Modules\Report\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('tenant')->prefix('v1/reports')->group(function () {
    Route::get('dashboard', [ReportController::class, 'dashboard']);
    Route::get('profit-loss', [ReportController::class, 'profitLoss']);
    Route::get('sales-summary', [ReportController::class, 'salesSummary']);
});
