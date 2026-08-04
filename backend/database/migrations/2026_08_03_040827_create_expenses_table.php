<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('category');
            $table->string('title');
            $table->unsignedBigInteger('amount');
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'expense_date'], 'expenses_business_expense_date_idx');
            $table->index(['business_id', 'category'], 'expenses_business_category_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
