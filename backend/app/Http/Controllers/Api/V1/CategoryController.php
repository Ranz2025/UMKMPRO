<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $business = app('current.business');
        $categories = Category::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->orderBy('name')
            ->get();

        return ApiResponse::success($categories, 'Daftar kategori');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
        ]);

        $business = app('current.business');

        $category = Category::create([
            'business_id' => $business->id,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
            'parent_id' => $data['parent_id'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        return ApiResponse::success($category, 'Kategori berhasil dibuat', 201);
    }
}
