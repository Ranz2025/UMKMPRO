<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryMovement extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    // Tidak pakai HasAuditLog — inventory movement IS the audit log untuk stok

    protected $fillable = [
        'business_id',
        'product_id',
        'user_id',
        'type',
        'quantity',
        'stock_before',
        'balance_after',
        'reference_type',
        'reference_id',
        'notes',
        'meta',
    ];

    protected $casts = [
        'quantity'     => 'integer',
        'stock_before' => 'integer',
        'balance_after'=> 'integer',
        'meta'         => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic reference — bisa ke Sale atau Purchase.
     * Contoh: $movement->reference → instance Sale atau Purchase
     */
    public function reference(): MorphTo
    {
        return $this->morphTo('reference');
    }
}
