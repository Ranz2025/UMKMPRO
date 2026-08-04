<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->has('current.business')) {
            return response()->json([
                'message' => 'Business aktif tidak ditemukan.',
                'code' => 'BUSINESS_REQUIRED',
            ], 400);
        }

        return $next($request);
    }
}
