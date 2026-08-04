<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private function activeBusinessFor(User $user): Business
    {
        $plan = Plan::factory()->create();
        $business = Business::factory()->create(['owner_id' => $user->id]);

        Subscription::factory()->create([
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
        ]);

        $user->businesses()->attach($business, ['role' => 'owner']);

        return $business;
    }

    public function test_responses_contain_security_headers(): void
    {
        $response = $this->getJson('/');

        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        // X-XSS-Protection dihapus karena merupakan header legacy (L-01 audit finding)
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // CSP: verifikasi ketat — tidak ada unsafe-eval (C-01 audit fix)
        $csp = $response->headers->get('Content-Security-Policy');
        $this->assertNotNull($csp);
        $this->assertStringNotContainsString("'unsafe-eval'", $csp);
        $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        $this->assertStringContainsString("base-uri 'self'", $csp);
    }

    public function test_input_sanitization_strips_dangerous_xss_scripts(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/categories', [
                'name' => 'Elektronik <script>alert("XSS")</script>',
                'description' => 'Kategori HP <script>eval("hack")</script>',
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('categories', [
            'name' => 'Elektronik ',
        ]);
    }

    public function test_auth_rate_limiting_throttles_too_many_login_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'hacker@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'hacker@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429);
    }

    public function test_cors_options_preflight_request(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'Content-Type, X-Business-Id',
        ])->optionsJson('/api/v1/auth/login');

        $response->assertNoContent();
    }

    public function test_audit_log_tracks_sensitive_model_creation(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $category = Category::factory()->for($business)->create();

        $product = Product::create([
            'business_id' => $business->id,
            'category_id' => $category->id,
            'sku' => 'AUDIT-001',
            'name' => 'Produk Audit Security',
            'cost_price' => 10000,
            'selling_price' => 15000,
            'stock' => 50,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => Product::class,
            'auditable_id'   => $product->id,
            'event'          => 'created',
        ]);
    }
}
