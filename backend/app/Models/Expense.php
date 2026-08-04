<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant, HasAuditLog;

    protected $fillable = [
        'business_id',
        'user_id',
        'category',
        'title',
        'amount',
        'expense_date',
        'notes',
    ];

    protected $casts = [
        'amount'       => 'integer',
        'expense_date' => 'date',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
