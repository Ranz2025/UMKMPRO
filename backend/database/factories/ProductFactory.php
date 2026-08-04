<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->words(3, true);
        return [
            'business_id' => null,
            'category_id' => null,
            'sku' => 'SKU-'.Str::upper(fake()->unique()->bothify('#####')),
            'name' => $name,
            'barcode' => fake()->ean13(),
            'description' => fake()->sentence(),
            'cost_price' => 10000,
            'selling_price' => 15000,
            'stock' => 10,
            'min_stock' => 2,
            'images' => [],
            'is_active' => true,
        ];
    }
}
