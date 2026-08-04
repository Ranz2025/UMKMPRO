<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    use HasFactory, BelongsToTenant, HasAuditLog;

    protected $fillable = [
        'business_id',
        'bank_account_id',
        'to_bank_account_id',
        'user_id',
        'type',
        'amount',
        'category',
        'reference',
        'notes',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function toBankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'to_bank_account_id');
    }
}
