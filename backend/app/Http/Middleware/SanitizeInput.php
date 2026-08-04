<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SanitizeInput
{
    private array $except = [
        'password',
        'password_confirmation',
        'current_password',
    ];

    public function handle(Request $request, Closure $next)
    {
        $input = $request->all();

        if (! empty($input)) {
            array_walk_recursive($input, function (&$value, $key) {
                if (is_string($value) && ! in_array($key, $this->except, true)) {
                    // Strip script tags with content first
                    $value = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $value);
                    // Then strip any remaining HTML tags
                    $value = strip_tags($value);
                }
            });

            $request->merge($input);
        }

        return $next($request);
    }
}
