<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Riwayat pergerakan stok (masuk/keluar/adjustment).
     */
    public function movements(Request $request): JsonResponse
    {
        $movements = InventoryMovement::with('product:id,name,sku')
            ->when($request->product_id, fn ($q) => $q->where('product_id', $request->product_id))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->start_date, fn ($q) => $q->whereDate('created_at', '>=', $request->start_date))
            ->when($request->end_date, fn ($q) => $q->whereDate('created_at', '<=', $request->end_date))
            ->latest()
            ->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $movements->items(),
            'meta'    => [
                'current_page' => $movements->currentPage(),
                'per_page'     => $movements->perPage(),
                'total'        => $movements->total(),
                'last_page'    => $movements->lastPage(),
            ],
        ]);
    }

    /**
     * Daftar produk dengan stok rendah (stok <= min_stock).
     */
    public function lowStock(Request $request): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->whereRaw('stock <= min_stock')
            ->with('category:id,name')
            ->orderBy('stock')
            ->get([
                'id', 'name', 'sku', 'stock', 'min_stock',
                'category_id', 'selling_price', 'cost_price',
            ]);

        return response()->json([
            'success' => true,
            'data'    => $products,
            'meta'    => [
                'total_low_stock' => $products->count(),
            ],
        ]);
    }

    /**
     * Adjustment stok manual (koreksi, dll).
     */
    public function adjust(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'not_in:0'],
            'type'       => ['required', 'in:adjustment_in,adjustment_out'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ]);

        $product     = Product::findOrFail($data['product_id']);
        $stockBefore = $product->stock;
        $change      = $data['type'] === 'adjustment_out'
            ? -abs($data['quantity'])
            : abs($data['quantity']);
        $stockAfter  = $stockBefore + $change;

        if ($stockAfter < 0) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tidak mencukupi. Stok saat ini: ' . $product->stock,
            ], 422);
        }

        DB::transaction(function () use ($product, $data, $change, $stockBefore, $stockAfter): void {
            InventoryMovement::create([
                'business_id'    => app('current.business')->id,
                'product_id'     => $product->id,
                'user_id'        => request()->user()?->id,
                'type'           => $data['type'],
                'quantity'       => $change,
                'stock_before'   => $stockBefore,
                'balance_after'  => $stockAfter,
                'reference_type' => 'manual',
                'reference_id'   => null,
                'notes'          => $data['notes'] ?? null,
            ]);

            $product->update(['stock' => $stockAfter]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Stok berhasil disesuaikan.',
            'data'    => [
                'product_id'   => $product->id,
                'product_name' => $product->name,
                'sku'          => $product->sku,
                'stock_before' => $stockBefore,
                'stock_after'  => $stockAfter,
                'change'       => $change,
                'type'         => $data['type'],
            ],
        ]);
    }

    /**
     * Opname stok — set stok ke nilai aktual hasil hitung fisik (batch).
     */
    public function opname(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'              => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.actual_qty' => ['required', 'integer', 'min:0'],
            'notes'              => ['nullable', 'string', 'max:500'],
        ]);

        $business  = app('current.business');
        $results   = [];
        $timestamp = now();

        DB::transaction(function () use ($data, $business, &$results, $timestamp, $request): void {
            foreach ($data['items'] as $item) {
                $product     = Product::findOrFail($item['product_id']);
                $stockBefore = $product->stock;
                $stockAfter  = $item['actual_qty'];
                $change      = $stockAfter - $stockBefore;

                InventoryMovement::create([
                    'business_id'    => $business->id,
                    'product_id'     => $product->id,
                    'user_id'        => $request->user()?->id,
                    'type'           => 'opname',
                    'quantity'       => $change,
                    'stock_before'   => $stockBefore,
                    'balance_after'  => $stockAfter,
                    'reference_type' => 'opname',
                    'reference_id'   => null,
                    'notes'          => $data['notes'] ?? 'Stock opname ' . $timestamp->toDateString(),
                ]);

                $product->update(['stock' => $stockAfter]);

                $results[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'sku'          => $product->sku,
                    'stock_before' => $stockBefore,
                    'stock_after'  => $stockAfter,
                    'difference'   => $change,
                ];
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Stock opname selesai. ' . count($results) . ' produk diperbarui.',
            'data'    => $results,
        ]);
    }
}
