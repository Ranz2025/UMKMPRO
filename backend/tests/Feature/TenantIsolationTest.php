<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveBusiness(): Business
    {
        $plan = Plan::factory()->create();
        $business = Business::factory()->create();
        Subscription::factory()->create([
            'business_id' => $business->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
        ]);

        return $business;
    }

    public function test_user_cannot_access_other_tenant_data(): void
    {
        $businessA = $this->createActiveBusiness();
        $businessB = $this->createActiveBusiness();

        $userA = User::factory()->create(['email_verified_at' => now()]);
        $userA->businesses()->attach($businessA, ['role' => 'owner']);

        $productB = Product::factory()->for($businessB)->create();

        $response = $this->actingAs($userA)
            ->withHeader('X-Business-Id', $businessA->id)
            ->getJson("/api/v1/products/{$productB->id}");

        $response->assertStatus(404);
    }

    public function test_product_list_only_returns_own_tenant_data(): void
    {
        $businessA = $this->createActiveBusiness();
        $businessB = $this->createActiveBusiness();

        Product::factory(5)->for($businessA)->create();
        Product::factory(3)->for($businessB)->create();

        $userA = User::factory()->create(['email_verified_at' => now()]);
        $userA->businesses()->attach($businessA, ['role' => 'owner']);

        $response = $this->actingAs($userA)
            ->withHeader('X-Business-Id', $businessA->id)
            ->getJson('/api/v1/products');

        $response->assertOk();
        $response->assertJsonCount(5, 'data');
    }
}
