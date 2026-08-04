<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\DTO\LoginDTO;
use App\Modules\Auth\DTO\RegisterDTO;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user and generate access token.
     */
    public function register(RegisterDTO $dto): array
    {
        $user = User::create([
            'name'      => $dto->name,
            'email'     => strtolower(trim($dto->email)),
            'password'  => Hash::make($dto->password),
            'phone'     => $dto->phone,
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Authenticate user with credentials and issue token.
     */
    public function login(LoginDTO $dto, string $ip): array
    {
        $throttleKey = 'login:' . Str::lower($dto->email) . ':' . $ip;

        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => ["Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik."],
            ]);
        }

        $user = User::where('email', strtolower(trim($dto->email)))->first();

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            RateLimiter::hit($throttleKey, 300);
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang Anda masukkan salah.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda tidak aktif. Silakan hubungi admin.'],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Email belum diverifikasi. Silakan cek inbox Anda.'],
            ])->redirectTo(route('verification.notice'));
        }

        RateLimiter::clear($throttleKey);

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Revoke current token upon logout.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
