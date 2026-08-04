<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Modules\Sales\Services\SaleService;
use App\Modules\Product\Services\ProductService;
use App\Exceptions\BusinessException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesServiceTest extends TestCase
{
    use RefreshDatabase;

    private SaleService $service;
    private User $user;
    private Business $business;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->business = Business::factory()->create(['owner_id' => $this->user->id]);
        $category = Category::create(['business_id' => $this->business->id, 'name' => 'Umum', 'slug' => 'umum-sales']);

        $this->product = Product::create([
            'business_id' => $this->business->id,
            'category_id' => $category->id,
            'name' => 'Kopi Robusta',
            'sku' => 'KOP-ROB-01',
            'cost_price' => 5000,
            'selling_price' => 12000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        $productService = $this->app->make(ProductService::class);
        $this->service = new SaleService($productService);
    }

    public function test_checkout_fails_if_items_empty(): void
    {
        $this->actingAs($this->user);
        app()->instance('current.business', $this->business);

        $this->expectException(BusinessException::class);

        $this->service->create([
            'payment_method' => 'Tunai',
            'items' => [],
        ], $this->user->id);
    }
}
