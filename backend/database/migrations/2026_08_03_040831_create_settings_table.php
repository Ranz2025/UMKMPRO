<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('key');
            $table->jsonb('value')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['business_id', 'key'], 'settings_business_key_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
