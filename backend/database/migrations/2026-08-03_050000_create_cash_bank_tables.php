<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->string('name');
            $table->string('bank_name')->default('Kas Utama');
            $table->string('account_number')->nullable();
            $table->string('type')->default('cash'); // cash, bank, e-wallet
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['business_id', 'is_active']);
        });

        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->onDelete('cascade');
            $table->foreignId('to_bank_account_id')->nullable()->constrained('bank_accounts')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('type'); // in, out, transfer
            $table->decimal('amount', 15, 2);
            $table->string('category')->default('Operasional');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->date('transaction_date');
            $table->timestamps();

            $table->index(['business_id', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('bank_accounts');
    }
};
