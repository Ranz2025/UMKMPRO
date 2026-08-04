<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->cascadeOnUpdate()->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->string('provider')->default('midtrans');
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('amount')->default(0);
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->jsonb('payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'status'], 'invoices_business_status_idx');
            $table->index(['status', 'due_at'], 'invoices_status_due_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
