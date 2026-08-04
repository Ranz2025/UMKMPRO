<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('product_name');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_cost');
            $table->unsignedBigInteger('line_total');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['purchase_id', 'product_id'], 'purchase_items_purchase_product_unique');
            $table->index(['product_id', 'purchase_id'], 'purchase_items_product_purchase_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
