<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('monthly_price')->default(0);
            $table->unsignedInteger('yearly_price')->default(0);
            $table->jsonb('features')->nullable();
            $table->unsignedInteger('max_users')->default(1);
            $table->unsignedInteger('max_businesses')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'created_at'], 'plans_active_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
