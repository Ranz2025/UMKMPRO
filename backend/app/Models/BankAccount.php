<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    use HasFactory, BelongsToTenant, HasAuditLog;

    protected $fillable = [
        'business_id',
        'name',
        'bank_name',
        'account_number',
        'type',
        'opening_balance',
        'current_balance',
        'is_active',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class, 'bank_account_id');
    }
}
