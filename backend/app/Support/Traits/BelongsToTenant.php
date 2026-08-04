<?php

namespace App\Support\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot trait — dua tugas:
     * 1. Auto-set business_id saat model di-create
     * 2. Tambahkan Global Scope agar semua query otomatis filter by business_id
     */
    protected static function bootBelongsToTenant(): void
    {
        // Auto-set business_id dari IoC container saat creating
        static::creating(function ($model): void {
            if (empty($model->business_id) && app()->has('current.business')) {
                $model->business_id = app('current.business')->id;
            }
        });

        // Global Scope — semua query otomatis where business_id = current business
        static::addGlobalScope('tenant', function (Builder $builder): void {
            if (app()->has('current.business')) {
                $table = $builder->getModel()->getTable();
                $builder->where("{$table}.business_id", app('current.business')->id);
            }
        });
    }

    /**
     * Relasi ke Business — tersedia di semua model yang pakai trait ini.
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Business::class, 'business_id');
    }

    /**
     * Helper untuk bypass Global Scope — HANYA untuk Admin Panel.
     * Jangan gunakan di tenant routes biasa.
     *
     * @example Product::withoutTenantScope()->where('stock', '<', 10)->get()
     */
    public static function withoutTenantScope(): Builder
    {
        return static::withoutGlobalScope('tenant');
    }

    /**
     * Helper untuk query tenant lain secara eksplisit — hanya Admin Panel.
     *
     * @example Product::forBusiness(5)->get()
     */
    public static function forBusiness(int $businessId): Builder
    {
        return static::withoutGlobalScope('tenant')
            ->where(with(new static())->getTable() . '.business_id', $businessId);
    }
}
