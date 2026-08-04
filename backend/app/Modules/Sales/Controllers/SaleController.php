<?php

namespace App\Modules\Sales\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Modules\Sales\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'start_date', 'end_date']);
        $result  = $this->service->list($filters, (int) $request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $result->items(),
            'meta'    => ['current_page' => $result->currentPage(), 'per_page' => $result->perPage(), 'total' => $result->total(), 'last_page' => $result->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id'        => 'nullable|integer|exists:customers,id',
            'sold_at'            => 'nullable|date',
            'discount_amount'    => 'nullable|integer|min:0',
            'tax_amount'         => 'nullable|integer|min:0',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|integer|min:0',
        ]);

        $sale = $this->service->create($data, $request->user()->id);

        return response()->json(['success' => true, 'message' => 'Penjualan berhasil dicatat.', 'data' => $sale], 201);
    }

    public function show(int $id): JsonResponse
    {
        $sale = Sale::with(['customer', 'items.product', 'user'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $sale]);
    }

    public function cancel(int $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);
        $sale = $this->service->cancel($sale);
        return response()->json(['success' => true, 'message' => 'Penjualan dibatalkan.', 'data' => $sale]);
    }
}
