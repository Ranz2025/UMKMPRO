<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use App\Providers\ModuleServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(ModuleServiceProvider::class);
    }

    public function boot(): void
    {
        // Rate limiter login/auth — max 5 attempt/menit per IP
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Rate limiter API umum — max 60 request/menit
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?? $request->ip()
            );
        });

        // Rate limiter POS Checkout & Sales — max 60 request/menit per user/IP
        RateLimiter::for('sales-pos', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?? $request->ip()
            );
        });

        // Rate limiter Laporan Heavy Export — max 10/jam per user terautentikasi (server-side key)
        // M-02: Tidak menggunakan X-Business-Id header karena bisa dimanipulasi client.
        RateLimiter::for('report-export', function (Request $request) {
            return Limit::perHour(10)->by(
                $request->user()?->id ?? $request->ip()
            );
        });
    }
}
