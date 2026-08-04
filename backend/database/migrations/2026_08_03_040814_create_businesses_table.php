<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('industry')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->jsonb('settings')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['owner_id', 'status'], 'businesses_owner_status_idx');
            $table->index(['status', 'created_at'], 'businesses_status_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
