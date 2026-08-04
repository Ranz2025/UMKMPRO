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

class SalesModuleTest extends TestCase
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

    public function test_user_can_create_and_cancel_sale(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $category = Category::factory()->for($business)->create();
        $product = Product::factory()->for($business)->create([
            'category_id' => $category->id,
            'stock' => 10,
            'selling_price' => 15000,
        ]);

        $sale = $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/sales', [
                'customer_id' => null,
                'sold_at' => now()->toDateTimeString(),
                'discount_amount' => 0,
                'tax_amount' => 0,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 2,
                        'unit_price' => 15000,
                    ],
                ],
            ])
            ->assertCreated()
            ->json('data');

        $this->assertDatabaseHas('sales', [
            'id' => $sale['id'],
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8,
        ]);

        $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/sales/'.$sale['id'].'/cancel')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('sales', [
            'id' => $sale['id'],
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }
}
