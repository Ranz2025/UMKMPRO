<?php

namespace App\Modules\Product\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Product\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'is_active', 'low_stock']);
        $result  = $this->service->list($filters, (int) $request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $result->items(),
            'meta'    => [
                'current_page' => $result->currentPage(),
                'per_page'     => $result->perPage(),
                'total'        => $result->total(),
                'last_page'    => $result->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'sku'         => 'required|string|max:100',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'cost_price'  => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'min_stock'   => 'required|integer|min:0',
            'barcode'     => 'nullable|string|max:100',
            'is_active'   => 'boolean',
        ]);

        $product = $this->service->create($data);

        return response()->json(['success' => true, 'message' => 'Produk berhasil dibuat.', 'data' => $product], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = $this->service->findOrFail($id);
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = $this->service->findOrFail($id);

        $data = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'sku'           => 'sometimes|required|string|max:100',
            'category_id'   => 'nullable|integer|exists:categories,id',
            'description'   => 'nullable|string',
            'cost_price'    => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'stock'         => 'sometimes|required|integer|min:0',
            'min_stock'     => 'sometimes|required|integer|min:0',
            'barcode'       => 'nullable|string|max:100',
            'is_active'     => 'boolean',
        ]);

        $product = $this->service->update($product, $data);

        return response()->json(['success' => true, 'message' => 'Produk diperbarui.', 'data' => $product]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = $this->service->findOrFail($id);
        $this->service->delete($product);
        return response()->json(['success' => true, 'message' => 'Produk dihapus.']);
    }
}
