<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $business = app('current.business');

        $products = Product::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->orderBy('id')
            ->get();

        return ApiResponse::success($products, 'Daftar produk');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'cost_price' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $business = app('current.business');

        $product = Product::create([
            ...$data,
            'business_id' => $business->id,
            'barcode' => null,
            'images' => null,
            'is_active' => true,
        ]);

        return ApiResponse::success($product, 'Produk berhasil dibuat', 201);
    }

    public function show(Request $request, int $product): JsonResponse
    {
        $business = app('current.business');

        $product = Product::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->findOrFail($product);

        return ApiResponse::success($product, 'Detail produk');
    }
}
