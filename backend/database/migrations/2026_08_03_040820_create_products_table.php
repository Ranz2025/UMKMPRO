<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->cascadeOnUpdate()->nullOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->string('barcode')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('cost_price')->default(0);
            $table->unsignedBigInteger('selling_price')->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->jsonb('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'sku'], 'products_business_sku_unique');
            $table->index(['business_id', 'category_id'], 'products_business_category_idx');
            $table->index(['business_id', 'is_active'], 'products_business_active_idx');
            $table->index(['business_id', 'stock'], 'products_business_stock_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
