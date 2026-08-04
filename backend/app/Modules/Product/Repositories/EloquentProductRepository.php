<?php

namespace App\Modules\Product\Repositories;

use App\Models\Product;
use App\Modules\Product\Repositories\Contracts\ProductRepositoryInterface;
use App\Support\BaseRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Product());
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->query()
            ->with('category')
            ->latest()
            ->paginate($perPage, $columns);
    }

    public function paginateWithFilters(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->query()
            ->with('category')
            ->when(isset($filters['search']), fn ($q) => $q->where(function ($q2) use ($filters) {
                $q2->where('name', 'like', '%' . $filters['search'] . '%')
                   ->orWhere('sku', 'like', '%' . $filters['search'] . '%');
            }))
            ->when(isset($filters['category_id']), fn ($q) => $q->where('category_id', $filters['category_id']))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', $filters['is_active']))
            ->when(isset($filters['low_stock']) && $filters['low_stock'], fn ($q) => $q->whereRaw('stock <= min_stock'))
            ->latest()
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Product
    {
        return $this->query()->with('category')->findOrFail($id);
    }

    public function create(array $data): Product
    {
        return $this->query()->create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = $this->findOrFail($id);
        $product->update($data);
        return $product->fresh('category');
    }

    public function delete(int $id): bool
    {
        $product = $this->findOrFail($id);
        return (bool) $product->delete();
    }

    public function findBySku(string $sku): ?Product
    {
        return $this->query()->where('sku', $sku)->first();
    }
}
