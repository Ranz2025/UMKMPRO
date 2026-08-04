<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
            $table->string('type');
            $table->integer('quantity');
            $table->integer('balance_after');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'product_id', 'created_at'], 'inventory_business_product_created_idx');
            $table->index(['product_id', 'type'], 'inventory_product_type_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
