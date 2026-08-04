<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->jsonb('properties')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'created_at'], 'activity_logs_business_created_idx');
            $table->index(['subject_type', 'subject_id'], 'activity_logs_subject_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
