<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id');
            $table->string('event');
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'created_at'], 'audit_logs_business_created_idx');
            $table->index(['auditable_type', 'auditable_id'], 'audit_logs_auditable_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
