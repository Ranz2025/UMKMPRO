<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * BaseService — kelas dasar untuk semua Service.
 *
 * Menyediakan method umum yang sering dipakai sehingga
 * setiap Service tidak perlu menulis boilerplate yang sama.
 *
 * Cara pakai:
 *   class ProductService extends BaseService { ... }
 */
abstract class BaseService
{
    /**
     * Jalankan callable dalam DB transaction.
     * Jika ada exception, transaction di-rollback otomatis.
     *
     * @template T
     * @param  callable(): T  $callback
     * @return T
     */
    protected function transaction(callable $callback): mixed
    {
        return \Illuminate\Support\Facades\DB::transaction($callback);
    }

    /**
     * Lempar BusinessException yang akan dirender sebagai JSON error.
     *
     * @throws \App\Exceptions\BusinessException
     */
    protected function fail(string $message, int $status = 422, string $code = 'BUSINESS_ERROR'): never
    {
        throw new \App\Exceptions\BusinessException($message, $status, $code);
    }

    /**
     * Pastikan kondisi true, jika tidak lempar BusinessException.
     *
     * @throws \App\Exceptions\BusinessException
     */
    protected function ensure(bool $condition, string $message, int $status = 422, string $code = 'VALIDATION_FAILED'): void
    {
        if (! $condition) {
            $this->fail($message, $status, $code);
        }
    }
}
