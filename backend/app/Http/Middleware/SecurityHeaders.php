<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        // X-XSS-Protection dihapus: header legacy, tidak efektif di browser modern — gunakan CSP
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set(
            'Content-Security-Policy',
            // unsafe-eval dihapus (C-01). unsafe-inline pada style-src dipertahankan karena
            // Vite/React menyuntikkan inline style saat runtime; mitigasi via Subresource Integrity.
            // Roadmap: ganti script-src menjadi nonce-based setelah SSR/CSP-nonce diaktifkan.
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' ws: wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        );

        return $response;
    }
}
