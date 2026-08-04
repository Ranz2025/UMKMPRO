<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\DTO\LoginDTO;
use App\Modules\Auth\DTO\RegisterDTO;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
    ) {}

    /**
     * Register user baru.
     * Mengirim email verifikasi secara otomatis via event Registered.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $dto = RegisterDTO::fromRequest($request);
        $result = $this->authService->register($dto);

        // Trigger email verifikasi
        event(new Registered($result['user']));

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
            'data'    => [
                'user'       => [
                    'id'    => $result['user']->id,
                    'name'  => $result['user']->name,
                    'email' => $result['user']->email,
                    'phone' => $result['user']->phone,
                ],
                'token'      => $result['token'],
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Verifikasi email via signed URL.
     */
    public function verifyEmail(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email sudah terverifikasi.',
            ]);
        }

        $request->fulfill();

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi. Anda sekarang bisa login.',
        ]);
    }

    /**
     * Kirim ulang email verifikasi.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email sudah terverifikasi.',
            ], 422);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => 'Email verifikasi telah dikirim ulang.',
        ]);
    }

    /**
     * Login dan dapatkan token Sanctum.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $dto = LoginDTO::fromRequest($request);
        $result = $this->authService->login($dto, $request->ip());

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'user'       => [
                    'id'    => $result['user']->id,
                    'name'  => $result['user']->name,
                    'email' => $result['user']->email,
                    'phone' => $result['user']->phone,
                ],
                'token'      => $result['token'],
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout — hapus token aktif.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Informasi user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('businesses:id,name,slug,industry,status');

        return response()->json([
            'success' => true,
            'data'    => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'phone'             => $user->phone,
                'avatar_url'        => $user->avatar_url,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at'     => $user->last_login_at,
                'businesses'        => $user->businesses->map(fn ($b) => [
                    'id'       => $b->id,
                    'name'     => $b->name,
                    'slug'     => $b->slug,
                    'industry' => $b->industry,
                    'role'     => $b->pivot->role,
                    'status'   => $b->status,
                ]),
            ],
        ]);
    }

    /**
     * Kirim link reset password ke email.
     * Menggunakan Laravel built-in Password broker.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Kirim reset link — Laravel akan handle token generation & email
        $status = Password::sendResetLink(
            $request->only('email'),
        );

        // Selalu kembalikan respons sukses (tidak ungkap apakah email terdaftar)
        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password akan dikirim dalam beberapa menit.',
        ]);
    }

    /**
     * Reset password dengan token dari email.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete(); // Revoke semua token lama
            },
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset. Silakan login dengan password baru.',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
