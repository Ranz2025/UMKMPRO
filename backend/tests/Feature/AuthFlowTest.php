<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Registrasi berhasil. Silakan cek email untuk verifikasi.');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    public function test_user_can_verify_email(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $response = $this->actingAs($user)->getJson($url);

        $response->assertOk()->assertJsonPath('message', 'Email berhasil diverifikasi. Anda sekarang bisa login.');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_login_after_verification(): void
    {
        $user = User::factory()->create([
            'email' => 'verified@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'verified@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'data' => ['user', 'token', 'token_type']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'fail@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'fail@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk()->assertJsonPath('data.email', $user->email);
    }
}
