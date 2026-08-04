<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom yang dibutuhkan Inventory module dan perluas enum type:
     * - stock_before   : stok sebelum adjustment (untuk audit trail)
     * - notes          : catatan adjustment manual
     * - type enum      : perluas dari [in,out,adjustment] ke semua tipe yang digunakan
     */
    public function up(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->integer('stock_before')->nullable()->after('quantity');
            $table->text('notes')->nullable()->after('meta');
        });

        if (DB::getDriverName() === 'pgsql') {
            // Di PostgreSQL, enum diimplementasikan sebagai CHECK constraint.
            // Hapus constraint lama dan ganti dengan yang mencakup semua tipe.
            DB::statement('ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_type_check');

            DB::statement("
                ALTER TABLE inventory_movements
                ADD CONSTRAINT inventory_movements_type_check
                CHECK (type IN (
                    'in',
                    'out',
                    'adjustment',
                    'adjustment_in',
                    'adjustment_out',
                    'opname',
                    'sale',
                    'purchase',
                    'return'
                ))
            ");
        }
    }

    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn(['stock_before', 'notes']);
        });

        DB::statement('ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_type_check');

        DB::statement("
            ALTER TABLE inventory_movements
            ADD CONSTRAINT inventory_movements_type_check
            CHECK (type IN ('in', 'out', 'adjustment'))
        ");
    }
};
