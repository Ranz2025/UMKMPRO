<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * BaseRepository — implementasi repository dasar.
 *
 * Setiap Repository konkret extend class ini dan di-bind ke Interface-nya
 * di ModuleServiceProvider.
 *
 * Cara pakai:
 *   class EloquentProductRepository extends BaseRepository
 *                                    implements ProductRepositoryInterface { ... }
 */
abstract class BaseRepository
{
    public function __construct(protected Model $model) {}

    /**
     * Cari record by primary key.
     * Return null jika tidak ditemukan (tidak melempar exception).
     */
    public function find(int $id): ?Model
    {
        return $this->model->newQuery()->find($id);
    }

    /**
     * Cari record by primary key.
     * Melempar ModelNotFoundException jika tidak ditemukan.
     *
     * @throws ModelNotFoundException
     */
    public function findOrFail(int $id): Model
    {
        return $this->model->newQuery()->findOrFail($id);
    }

    /**
     * Ambil semua record (gunakan dengan hati-hati di dataset besar).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all(array $columns = ['*']): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->newQuery()->get($columns);
    }

    /**
     * Paginate semua record.
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->newQuery()->paginate($perPage, $columns);
    }

    /**
     * Buat record baru.
     */
    public function create(array $data): Model
    {
        return $this->model->newQuery()->create($data);
    }

    /**
     * Update record by ID.
     *
     * @throws ModelNotFoundException
     */
    public function update(int $id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record->fresh();
    }

    /**
     * Soft-delete record by ID.
     *
     * @throws ModelNotFoundException
     */
    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);
        return (bool) $record->delete();
    }

    /**
     * Akses query builder model secara langsung dari subclass.
     */
    protected function query(): \Illuminate\Database\Eloquent\Builder
    {
        return $this->model->newQuery();
    }
}
