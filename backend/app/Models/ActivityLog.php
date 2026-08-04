<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityLog extends Model
{
    use HasFactory, SoftDeletes;

    // Tidak boleh pakai HasAuditLog — rekursi tak terbatas
    // Tidak boleh pakai BelongsToTenant — activity log bisa lintas tenant (admin)

    protected $fillable = [
        'business_id',
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper statik untuk menulis log dengan mudah dari mana saja.
     *
     * @example ActivityLog::log('product.created', $product);
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        array $properties = []
    ): self {
        return static::create([
            'business_id'  => app()->has('current.business')
                ? app('current.business')->id
                : null,
            'user_id'      => auth()->id(),
            'action'       => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id'   => $subject?->getKey(),
            'properties'   => $properties,
        ]);
    }
}
