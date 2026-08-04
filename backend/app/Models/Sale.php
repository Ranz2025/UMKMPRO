<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant, HasAuditLog;

    protected $fillable = [
        'business_id',
        'customer_id',
        'user_id',
        'invoice_number',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'status',
        'sold_at',
        'meta',
    ];

    protected $casts = [
        'subtotal'        => 'integer',
        'discount_amount' => 'integer',
        'tax_amount'      => 'integer',
        'grand_total'     => 'integer',
        'sold_at'         => 'datetime',
        'meta'            => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /** Scope hanya sale yang sudah paid */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
