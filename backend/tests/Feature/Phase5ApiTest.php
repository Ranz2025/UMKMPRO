<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase5ApiTest extends TestCase
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

    public function test_user_can_list_businesses(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/businesses');

        $response->assertOk()->assertJsonPath('success', true)->assertJsonStructure(['success', 'data']);
    }

    public function test_user_can_create_core_resources_for_active_tenant(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $category = $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/categories', [
                'name' => 'Makanan',
                'description' => 'Kategori makanan',
            ])
            ->assertCreated()
            ->json('data');

        $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/products', [
                'name' => 'Mie Goreng',
                'sku' => 'MIE-001',
                'category_id' => $category['id'],
                'cost_price' => 2000,
                'selling_price' => 3000,
                'stock' => 100,
                'min_stock' => 10,
                'description' => 'Produk contoh',
            ])
            ->assertCreated();

        $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/customers', [
                'name' => 'Andi',
                'phone' => '08123456789',
                'email' => 'andi@example.com',
                'address' => 'Bandung',
            ])
            ->assertCreated();

        $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/suppliers', [
                'name' => 'Toko Sumber',
                'phone' => '08129876543',
                'email' => 'supplier@example.com',
                'address' => 'Jakarta',
            ])
            ->assertCreated();
    }

    public function test_user_can_list_products_for_active_tenant(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Product::factory()->count(2)->for($business)->create();
        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Business-Id', $business->id)->getJson('/api/v1/products');

        $response->assertOk()->assertJsonPath('success', true)->assertJsonStructure(['success', 'data']);
    }

    public function test_user_can_list_customers_and_suppliers(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Customer::factory()->for($business)->create();
        Supplier::factory()->for($business)->create();
        Sanctum::actingAs($user);

        $this->withHeader('X-Business-Id', $business->id)
            ->getJson('/api/v1/customers')
            ->assertOk();

        $this->withHeader('X-Business-Id', $business->id)
            ->getJson('/api/v1/suppliers')
            ->assertOk();
    }
}
