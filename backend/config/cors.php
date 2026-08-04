<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | OWASP Top 10 A05: Security Misconfiguration hardening.
    | Strictly specify allowed origins, methods, and headers.
    |
    */

    'paths' => ['api/*', 'v1/*', 'sanctum/csrf-cookie', 'login', 'register'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-Business-Id',
    ],

    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,

];
