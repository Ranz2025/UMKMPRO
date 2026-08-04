<?php

namespace Tests\Feature;

use App\Jobs\SendLowStockAlertJob;
use App\Jobs\UpdateCustomerStatsJob;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PerformanceTest extends TestCase
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

    public function test_active_plans_endpoint_uses_caching(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user);

        Plan::factory()->create(['is_active' => true, 'monthly_price' => 100000]);

        $response1 = $this->getJson('/api/v1/plans');
        $response1->assertOk();

        $this->assertTrue(Cache::has('plans:active'));

        $response2 = $this->getJson('/api/v1/plans');
        $response2->assertOk();
    }

    public function test_dashboard_endpoint_uses_caching(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        Sanctum::actingAs($user);

        $response1 = $this->withHeader('X-Business-Id', $business->id)
            ->getJson('/api/v1/reports/dashboard?period=today');
        $response1->assertOk();

        $cacheKey = "dashboard:summary:{$business->id}:today:".now()->format('YmdH');
        $this->assertTrue(Cache::has($cacheKey));
    }

    public function test_async_jobs_can_be_dispatched_to_queue(): void
    {
        Queue::fake();

        $user = User::factory()->create(['email_verified_at' => now()]);
        $business = $this->activeBusinessFor($user);
        $category = Category::factory()->for($business)->create();
        $product = Product::factory()->for($business)->create(['category_id' => $category->id]);
        $customer = Customer::factory()->create(['business_id' => $business->id]);

        SendLowStockAlertJob::dispatch($business->id, $product->id);
        UpdateCustomerStatsJob::dispatch($customer->id);

        Queue::assertPushed(SendLowStockAlertJob::class);
        Queue::assertPushed(UpdateCustomerStatsJob::class);
    }
}
