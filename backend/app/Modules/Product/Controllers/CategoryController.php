<?php

namespace App\Modules\Product\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $data['slug'] = Str::slug($data['name']);
        $category = Category::create($data);
        return response()->json(['success' => true, 'message' => 'Kategori dibuat.', 'data' => $category], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $data = $request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string']);
        $data['slug'] = Str::slug($data['name']);
        $category->update($data);
        return response()->json(['success' => true, 'message' => 'Kategori diperbarui.', 'data' => $category->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Category::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Kategori dihapus.']);
    }
}
