<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id',
        'plan_id',
        'status',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'cancelled_at',
    ];

    protected $casts = [
        'starts_at'     => 'datetime',
        'ends_at'       => 'datetime',
        'trial_ends_at' => 'datetime',
        'cancelled_at'  => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /** Cek apakah subscription masih aktif */
    public function isActive(): bool
    {
        return $this->status === 'active'
            && ($this->ends_at === null || now()->lte($this->ends_at));
    }

    /** Cek apakah sudah expired */
    public function isExpired(): bool
    {
        return $this->ends_at !== null && now()->gt($this->ends_at);
    }

    /** Scope hanya subscription aktif */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
