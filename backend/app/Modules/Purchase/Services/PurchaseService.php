<?php

namespace App\Modules\Purchase\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Modules\Product\Services\ProductService;
use App\Support\BaseService;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseService extends BaseService
{
    public function __construct(private readonly ProductService $productService) {}

    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Purchase::with(['supplier', 'items', 'user'])
            ->when(isset($filters['search']), fn ($q) => $q->where('invoice_number', 'like', '%'.$filters['search'].'%'))
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['supplier_id']), fn ($q) => $q->where('supplier_id', $filters['supplier_id']))
            ->when(isset($filters['start_date']), fn ($q) => $q->whereDate('purchased_at', '>=', $filters['start_date']))
            ->when(isset($filters['end_date']), fn ($q) => $q->whereDate('purchased_at', '<=', $filters['end_date']))
            ->latest('purchased_at')
            ->paginate($perPage);
    }

    public function create(array $data, int $userId): Purchase
    {
        return $this->transaction(function () use ($data, $userId) {
            $business = app('current.business');

            // Generate nomor invoice
            $invoiceNumber = $this->generateInvoiceNumber($business->id);

            // Hitung subtotal
            $subtotal = 0;
            $itemsToCreate = [];
            foreach ($data['items'] as $item) {
                $product   = Product::findOrFail($item['product_id']);
                $lineTotal = $item['unit_cost'] * $item['quantity'];
                $subtotal += $lineTotal;

                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'quantity'     => $item['quantity'],
                    'unit_cost'    => $item['unit_cost'],
                    'line_total'   => $lineTotal,
                ];
            }

            $tax        = $data['tax_amount'] ?? 0;
            $grandTotal = $subtotal + $tax;

            // Buat purchase
            $purchase = Purchase::create([
                'business_id'    => $business->id,
                'supplier_id'    => $data['supplier_id'] ?? null,
                'user_id'        => $userId,
                'invoice_number' => $invoiceNumber,
                'subtotal'       => $subtotal,
                'tax_amount'     => $tax,
                'grand_total'    => $grandTotal,
                'status'         => 'received',
                'purchased_at'   => $data['purchased_at'] ?? now(),
            ]);

            // Buat purchase items
            $purchase->items()->createMany($itemsToCreate);

            // Tambah stok produk
            foreach ($itemsToCreate as $item) {
                $product = Product::find($item['product_id']);
                $this->productService->adjustStock(
                    $product,
                    $item['quantity'],   // positif = stok masuk
                    'purchase',
                    $purchase->id,
                    Purchase::class,
                    $userId
                );
            }

            return $purchase->load(['supplier', 'items.product']);
        });
    }

    public function delete(Purchase $purchase): void
    {
        // Jika status received, kembalikan stok
        if ($purchase->status === 'received') {
            foreach ($purchase->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $this->productService->adjustStock(
                        $product,
                        -$item->quantity,
                        'adjustment',
                        $purchase->id,
                        Purchase::class,
                        auth()->id()
                    );
                }
            }
        }

        $purchase->delete();
    }

    private function generateInvoiceNumber(int $businessId): string
    {
        $date  = now()->format('Ymd');
        $count = Purchase::withoutGlobalScope('tenant')
            ->where('business_id', $businessId)
            ->whereDate('created_at', today())
            ->count() + 1;

        return 'PO-'.$date.'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
