<?php

namespace App\Modules\Product\Services;

use App\Models\Product;
use App\Modules\Product\Repositories\Contracts\ProductRepositoryInterface;
use App\Support\BaseService;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService extends BaseService
{
    public function __construct(
        private readonly ProductRepositoryInterface $repo
    ) {}

    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return method_exists($this->repo, 'paginateWithFilters')
            ? $this->repo->paginateWithFilters($filters, $perPage)
            : $this->repo->paginate($perPage);
    }

    public function findOrFail(int $id): Product
    {
        return $this->repo->findOrFail($id);
    }

    public function create(array $data): Product
    {
        // Pastikan SKU unik di tenant ini (Global Scope sudah aktif)
        if ($this->repo->findBySku($data['sku'])) {
            $this->fail("SKU '{$data['sku']}' sudah digunakan.", 422, 'SKU_DUPLICATE');
        }

        return $this->repo->create($data);
    }

    public function update(Product $product, array $data): Product
    {
        // Jika SKU berubah, pastikan tidak duplikat
        if (isset($data['sku']) && $data['sku'] !== $product->sku) {
            $existing = $this->repo->findBySku($data['sku']);
            if ($existing && $existing->id !== $product->id) {
                $this->fail("SKU '{$data['sku']}' sudah digunakan.", 422, 'SKU_DUPLICATE');
            }
        }

        return $this->repo->update($product->id, $data);
    }

    public function delete(Product $product): bool
    {
        return $this->repo->delete($product->id);
    }

    public function adjustStock(Product $product, int $qty, string $type, ?int $refId = null, ?string $refType = null, ?int $userId = null): void
    {
        $stockBefore = $product->stock;
        $newStock    = $stockBefore + $qty;

        $this->ensure($newStock >= 0, "Stok '{$product->name}' tidak mencukupi. Sisa: {$stockBefore}.", 422, 'INSUFFICIENT_STOCK');

        $product->update(['stock' => $newStock]);

        $movementType = match ($type) {
            'sale' => 'out',
            'purchase' => 'in',
            'return' => 'in',
            default => $type,
        };

        \App\Models\InventoryMovement::create([
            'business_id'    => $product->business_id,
            'product_id'     => $product->id,
            'user_id'        => $userId ?? auth()->id(),
            'type'           => $movementType,
            'quantity'       => $qty,
            'stock_before'   => $stockBefore,
            'balance_after'  => $newStock,
            'reference_type' => $refType,
            'reference_id'   => $refId,
        ]);
    }
}
