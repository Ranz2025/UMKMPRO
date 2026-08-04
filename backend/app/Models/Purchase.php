<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant, HasAuditLog;

    protected $fillable = [
        'business_id',
        'supplier_id',
        'user_id',
        'invoice_number',
        'subtotal',
        'tax_amount',
        'grand_total',
        'status',
        'purchased_at',
        'meta',
    ];

    protected $casts = [
        'subtotal'     => 'integer',
        'tax_amount'   => 'integer',
        'grand_total'  => 'integer',
        'purchased_at' => 'datetime',
        'meta'         => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
