<?php

namespace App\Modules\Purchase\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Modules\Purchase\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private readonly PurchaseService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'supplier_id', 'start_date', 'end_date']);
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
            'supplier_id'        => 'nullable|integer|exists:suppliers,id',
            'purchased_at'       => 'nullable|date',
            'tax_amount'         => 'nullable|integer|min:0',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_cost'  => 'required|integer|min:0',
        ]);

        $purchase = $this->service->create($data, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Pembelian berhasil dicatat.',
            'data'    => $purchase,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $purchase = Purchase::with(['supplier', 'items.product', 'user'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $purchase]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $purchase = Purchase::findOrFail($id);

        $data = $request->validate([
            'supplier_id'  => 'nullable|integer|exists:suppliers,id',
            'purchased_at' => 'nullable|date',
            'tax_amount'   => 'nullable|integer|min:0',
        ]);

        $purchase->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Pembelian diperbarui.',
            'data'    => $purchase->fresh(['supplier', 'items.product']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $purchase = Purchase::findOrFail($id);

        $this->service->delete($purchase);

        return response()->json(['success' => true, 'message' => 'Pembelian dihapus.']);
    }
}
