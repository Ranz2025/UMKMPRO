<?php

use App\Http\Middleware\CheckSubscription;
use App\Http\Middleware\EnsureTenantAccess;
use App\Http\Middleware\SanitizeInput;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetActiveBusiness;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Prepend global security middleware to all requests
        $middleware->append(SecurityHeaders::class);
        $middleware->append(SanitizeInput::class);

        $middleware->alias([
            // Sanctum
            'auth:sanctum'       => \Laravel\Sanctum\Http\Middleware\Authenticate::class,

            // Spatie Permission
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,

            // Security & Tenant stack
            'security.headers'   => SecurityHeaders::class,
            'sanitize.input'     => SanitizeInput::class,
            'tenant.set'         => SetActiveBusiness::class,
            'tenant.access'      => EnsureTenantAccess::class,
            'tenant.subscription'=> CheckSubscription::class,
        ]);

        // Grup shortcut untuk tenant routes
        $middleware->appendToGroup('tenant', [
            'auth:sanctum',
            SetActiveBusiness::class,
            EnsureTenantAccess::class,
            CheckSubscription::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Semua route /api/* dan /v1/* → response JSON
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->is('v1/*'),
        );
    })->create();
