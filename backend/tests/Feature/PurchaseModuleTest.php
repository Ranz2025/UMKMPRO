<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PurchaseModuleTest extends TestCase
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

    public function test_user_can_create_purchase_and_stock_increases(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $category = Category::factory()->for($business)->create();
        $product = Product::factory()->for($business)->create([
            'category_id' => $category->id,
            'stock' => 3,
            'cost_price' => 5000,
        ]);
        $supplier = Supplier::factory()->for($business)->create();

        $purchase = $this->withHeader('X-Business-Id', $business->id)
            ->postJson('/api/v1/purchases', [
                'supplier_id' => $supplier->id,
                'purchased_at' => now()->toDateTimeString(),
                'tax_amount' => 0,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 5,
                        'unit_cost' => 4000,
                    ],
                ],
            ])
            ->assertCreated()
            ->json('data');

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase['id'],
            'status' => 'received',
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8,
        ]);

        $this->withHeader('X-Business-Id', $business->id)
            ->deleteJson('/api/v1/purchases/'.$purchase['id'])
            ->assertOk();

        $this->assertSoftDeleted('purchases', ['id' => $purchase['id']]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 3,
        ]);
    }
}
