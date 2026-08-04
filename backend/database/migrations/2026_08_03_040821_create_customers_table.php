<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'email'], 'customers_business_email_unique');
            $table->index(['business_id', 'name'], 'customers_business_name_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
