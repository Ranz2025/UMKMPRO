<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->cascadeOnUpdate()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'slug'], 'categories_business_slug_unique');
            $table->index(['business_id', 'name'], 'categories_business_name_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
