<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    private array $excludedRoutes = [
        'api/v1/billing*',
        'api/v1/business/settings',
        'api/v1/auth/logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->excludedRoutes as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        if (! app()->has('current.business')) {
            return $next($request);
        }

        $business = app('current.business');
        $subscription = $business->activeSubscription;

        if (! $subscription) {
            return response()->json([
                'message' => 'Subscription tidak aktif. Silakan perpanjang paket Anda.',
                'code' => 'SUBSCRIPTION_REQUIRED',
                'redirect' => '/billing',
            ], 402);
        }

        return $next($request);
    }
}
