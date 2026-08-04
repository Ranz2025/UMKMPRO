<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Modules\Product\Repositories\Contracts\ProductRepositoryInterface;
use App\Modules\Product\Services\ProductService;
use App\Exceptions\BusinessException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProductService $service;
    private MockInterface $repository;
    private User $user;
    private Business $business;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->business = Business::factory()->create(['owner_id' => $this->user->id]);
        $this->category = Category::create(['business_id' => $this->business->id, 'name' => 'Umum', 'slug' => 'umum']);

        $this->repository = Mockery::mock(ProductRepositoryInterface::class);
        $this->service = new ProductService($this->repository);
    }

    public function test_can_create_product_successfully(): void
    {
        $data = [
            'category_id' => $this->category->id,
            'name' => 'Kopi Gula Aren',
            'sku' => 'KOP-001',
            'cost_price' => 7000,
            'selling_price' => 15000,
            'stock' => 50,
            'min_stock' => 5,
        ];

        $mockProduct = new Product($data + ['id' => 1, 'business_id' => $this->business->id]);

        $this->repository
            ->shouldReceive('findBySku')
            ->once()
            ->with('KOP-001')
            ->andReturn(null);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with($data)
            ->andReturn($mockProduct);

        $result = $this->service->create($data);

        $this->assertEquals('Kopi Gula Aren', $result->name);
        $this->assertEquals('KOP-001', $result->sku);
    }

    public function test_create_product_throws_exception_on_duplicate_sku(): void
    {
        $data = [
            'name' => 'Kopi Gula Aren',
            'sku' => 'KOP-001',
        ];

        $existingProduct = new Product(['id' => 1, 'sku' => 'KOP-001']);

        $this->repository
            ->shouldReceive('findBySku')
            ->once()
            ->with('KOP-001')
            ->andReturn($existingProduct);

        $this->expectException(BusinessException::class);
        $this->expectExceptionMessage("SKU 'KOP-001' sudah digunakan.");

        $this->service->create($data);
    }

    public function test_adjust_stock_insufficient_stock_throws_exception(): void
    {
        $product = Product::create([
            'business_id' => $this->business->id,
            'category_id' => $this->category->id,
            'name' => 'Roti Bakar',
            'sku' => 'ROT-001',
            'cost_price' => 5000,
            'selling_price' => 10000,
            'stock' => 2,
            'min_stock' => 5,
        ]);

        $this->actingAs($this->user);

        $this->expectException(BusinessException::class);
        $this->expectExceptionMessage("Stok 'Roti Bakar' tidak mencukupi.");

        $this->service->adjustStock($product, -5, 'sale', 1, 'sale', $this->user->id);
    }
}
