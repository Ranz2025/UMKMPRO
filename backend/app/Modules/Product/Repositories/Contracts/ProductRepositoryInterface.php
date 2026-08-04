<?php

namespace App\Modules\Product\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;
    public function findOrFail(int $id): Product;
    public function create(array $data): Product;
    public function update(int $id, array $data): Product;
    public function delete(int $id): bool;
    public function findBySku(string $sku): ?Product;
}
