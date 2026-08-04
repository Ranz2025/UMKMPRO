<?php

namespace App\Models;

use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, SoftDeletes, HasAuditLog;

    protected $fillable = [
        'owner_id', 'name', 'slug', 'industry', 'phone', 'email', 'address', 'settings', 'status',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function owner(): BelongsTo { return $this->belongsTo(User::class, 'owner_id'); }
    public function users(): BelongsToMany { return $this->belongsToMany(User::class)->withPivot(['role'])->withTimestamps(); }
    public function subscriptions(): HasMany { return $this->hasMany(Subscription::class); }
    public function activeSubscription(): HasOne { return $this->hasOne(Subscription::class)->where('status', 'active')->latest(); }
    public function categories(): HasMany { return $this->hasMany(Category::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function customers(): HasMany { return $this->hasMany(Customer::class); }
    public function suppliers(): HasMany { return $this->hasMany(Supplier::class); }
    public function sales(): HasMany { return $this->hasMany(Sale::class); }
    public function purchases(): HasMany { return $this->hasMany(Purchase::class); }
    public function expenses(): HasMany { return $this->hasMany(Expense::class); }
}
