<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('discount_amount')->default(0);
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->unsignedBigInteger('grand_total')->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('sold_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'sold_at'], 'sales_business_sold_at_idx');
            $table->index(['business_id', 'status'], 'sales_business_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
