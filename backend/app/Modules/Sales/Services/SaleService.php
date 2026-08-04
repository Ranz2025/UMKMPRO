<?php

namespace App\Modules\Sales\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Modules\Product\Services\ProductService;
use App\Support\BaseService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SaleService extends BaseService
{
    public function __construct(private readonly ProductService $productService) {}

    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Sale::with(['customer', 'items', 'user'])
            ->when(isset($filters['search']), fn ($q) => $q->where('invoice_number', 'like', '%'.$filters['search'].'%'))
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['start_date']), fn ($q) => $q->whereDate('sold_at', '>=', $filters['start_date']))
            ->when(isset($filters['end_date']), fn ($q) => $q->whereDate('sold_at', '<=', $filters['end_date']))
            ->latest('sold_at')
            ->paginate($perPage);
    }

    public function create(array $data, int $userId): Sale
    {
        return $this->transaction(function () use ($data, $userId) {
            $this->ensure(!empty($data['items']), 'Detail item penjualan tidak boleh kosong.', 422, 'EMPTY_ITEMS');

            // Validasi stok semua item sebelum apapun
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $this->ensure(
                    $product->stock >= $item['quantity'],
                    "Stok '{$product->name}' tidak mencukupi. Sisa: {$product->stock}.",
                    422, 'INSUFFICIENT_STOCK'
                );
            }

            $business = app('current.business');

            // Generate nomor invoice
            $invoiceNumber = $this->generateInvoiceNumber($business->id);

            // Hitung total
            $subtotal = 0;
            $itemsToCreate = [];
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = $item['unit_price'] ?? $product->selling_price;
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;
                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $unitPrice,
                    'line_total'   => $lineTotal,
                ];
            }

            $discount = $data['discount'] ?? 0;
            $tax      = $data['tax'] ?? 0;
            $grandTotal = $subtotal - $discount + $tax;

            // Simpan Sale
            $sale = Sale::create([
                'business_id'     => $business->id,
                'user_id'         => $userId,
                'customer_id'     => $data['customer_id'] ?? null,
                'invoice_number'  => $invoiceNumber,
                'sold_at'         => $data['sold_at'] ?? now(),
                'status'          => 'paid',
                'payment_method'  => $data['payment_method'] ?? 'cash',
                'subtotal'        => $subtotal,
                'discount'        => $discount,
                'tax'             => $tax,
                'grand_total'     => $grandTotal,
                'paid_amount'     => $data['paid_amount'] ?? $grandTotal,
                'change_amount'   => max(0, ($data['paid_amount'] ?? $grandTotal) - $grandTotal),
                'notes'           => $data['notes'] ?? null,
            ]);

            // Simpan item & kurangi stok
            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);

                $product = Product::findOrFail($itemData['product_id']);
                $this->productService->adjustStock(
                    product: $product,
                    qty: -$itemData['quantity'],
                    type: 'sale',
                    refId: $sale->id,
                    refType: Sale::class,
                    userId: $userId
                );
            }

            return $sale->load(['items', 'customer', 'user']);
        });
    }

    public function cancel(Sale $sale): Sale
    {
        return $this->transaction(function () use ($sale) {
            $this->ensure($sale->status === 'paid', 'Hanya transaksi yang sudah lunas yang dapat dibatalkan.', 422, 'INVALID_STATUS');

            // Kembalikan stok
            foreach ($sale->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $this->productService->adjustStock(
                        product: $product,
                        qty: $item->quantity,
                        type: 'return',
                        refId: $sale->id,
                        refType: Sale::class,
                        userId: auth()->id()
                    );
                }
            }

            $sale->update(['status' => 'cancelled']);

            return $sale->fresh(['items']);
        });
    }

    private function generateInvoiceNumber(int $businessId): string
    {
        $dateStr = now()->format('Ymd');
        $prefix  = "INV-{$dateStr}-";

        $last = Sale::where('business_id', $businessId)
            ->where('invoice_number', 'like', "{$prefix}%")
            ->latest('id')
            ->first();

        if (! $last) {
            return "{$prefix}0001";
        }

        $lastNum = (int) substr($last->invoice_number, -4);

        return $prefix.str_pad((string) ($lastNum + 1), 4, '0', STR_PAD_LEFT);
    }
}
