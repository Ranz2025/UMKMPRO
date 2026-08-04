<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = ['business_id', 'name', 'phone', 'email', 'address', 'meta'];

    protected $casts = ['meta' => 'array'];

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function sales(): HasMany { return $this->hasMany(Sale::class); }
}
