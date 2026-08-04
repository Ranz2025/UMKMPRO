<?php

namespace App\Http\Middleware;

use App\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetActiveBusiness
{
    /**
     * Baca Business ID dari header X-Business-Id atau query param business_id,
     * verifikasi user adalah member dari business tersebut,
     * lalu bind instance ke IoC container sebagai 'current.business'.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $businessId = $request->header('X-Business-Id') ?? $request->query('business_id');

        if ($businessId) {
            $business = Business::query()->where('status', 'active')->find($businessId);

            if ($business) {
                // SECURITY: Pastikan user yang login adalah member dari business ini
                $user = $request->user();

                if ($user && $user->businesses()->whereKey($business->id)->exists()) {
                    app()->instance('current.business', $business);
                }
                // Jika user bukan member, business tidak di-set (akan ditangani EnsureTenantAccess)
            }
        }

        return $next($request);
    }
}
