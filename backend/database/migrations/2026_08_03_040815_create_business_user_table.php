<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->enum('role', ['owner', 'admin', 'staff'])->default('staff');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'user_id'], 'business_user_business_id_user_id_unique');
            $table->index(['user_id', 'business_id'], 'business_user_user_business_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_user');
    }
};
