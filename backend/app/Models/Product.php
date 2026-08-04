<?php

namespace App\Models;

use App\Support\Traits\BelongsToTenant;
use App\Support\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant, HasAuditLog;

    protected $fillable = ['business_id', 'category_id', 'sku', 'name', 'barcode', 'description', 'cost_price', 'selling_price', 'stock', 'min_stock', 'images', 'is_active'];

    protected $casts = ['images' => 'array', 'is_active' => 'boolean'];

    public function business(): BelongsTo { return $this->belongsTo(Business::class); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function saleItems(): HasMany { return $this->hasMany(SaleItem::class); }
    public function purchaseItems(): HasMany { return $this->hasMany(PurchaseItem::class); }
    public function movements(): HasMany { return $this->hasMany(InventoryMovement::class); }
}
