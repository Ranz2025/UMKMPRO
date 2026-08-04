<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_message(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Jika email terdaftar, link reset password akan dikirim dalam beberapa menit.');
    }

    public function test_user_can_reset_password(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertOk()->assertJsonPath('message', 'Password berhasil direset. Silakan login dengan password baru.');
    }
}
