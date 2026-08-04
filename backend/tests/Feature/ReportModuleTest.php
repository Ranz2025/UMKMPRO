<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportModuleTest extends TestCase
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

    public function test_user_can_view_dashboard_and_sales_summary(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $category = Category::factory()->for($business)->create();
        $product = Product::factory()->for($business)->create([
            'category_id' => $category->id,
            'stock' => 20,
            'selling_price' => 15000,
            'cost_price' => 10000,
        ]);

        $sale = Sale::factory()->for($business)->create([
            'user_id' => $user->id,
            'status' => 'paid',
            'sold_at' => now(),
            'grand_total' => 30000,
        ]);
        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'unit_price' => 15000,
            'line_total' => 30000,
        ]);

        Expense::factory()->for($business)->create([
            'user_id' => $user->id,
            'amount' => 5000,
            'expense_date' => now()->toDateString(),
        ]);

        Purchase::factory()->for($business)->create([
            'user_id' => $user->id,
            'status' => 'received',
            'grand_total' => 20000,
            'purchased_at' => now(),
        ]);

        $this->withHeader('X-Business-Id', $business->id)
            ->getJson('/api/v1/reports/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data']);

        $this->withHeader('X-Business-Id', $business->id)
            ->getJson('/api/v1/reports/sales-summary?start_date='.now()->toDateString().'&end_date='.now()->toDateString().'&group_by=day')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data']);
    }
}
