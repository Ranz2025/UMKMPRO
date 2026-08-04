<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'status'], 'subscriptions_business_status_idx');
            $table->index(['plan_id', 'status'], 'subscriptions_plan_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
