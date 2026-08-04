<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->unsignedBigInteger('grand_total')->default(0);
            $table->enum('status', ['draft', 'received', 'cancelled'])->default('draft');
            $table->timestamp('purchased_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'purchased_at'], 'purchases_business_purchased_at_idx');
            $table->index(['business_id', 'status'], 'purchases_business_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
