<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\CashSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['owner', 'admin', 'staff', 'accountant'];
        foreach ($roles as $role) {
            Role::findOrCreate($role, 'web');
        }

        $permissions = [
            'business.manage',
            'products.view', 'products.create', 'products.update', 'products.delete',
            'sales.view', 'sales.create', 'sales.update', 'sales.delete', 'sales.cancel', 'sales.refund',
            'purchases.view', 'purchases.create', 'purchases.update',
            'customers.view', 'customers.create', 'customers.update', 'customers.delete',
            'suppliers.view', 'suppliers.create', 'suppliers.update',
            'reports.view', 'reports.export',
            'settings.view', 'settings.update',
            'team.view', 'team.invite', 'team.remove', 'team.manage_roles',
            'billing.view', 'billing.manage',
            'expenses.view', 'expenses.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $free = Plan::firstOrCreate(['code' => 'FREE'], ['name' => 'Free', 'description' => 'Free plan', 'monthly_price' => 0, 'yearly_price' => 0, 'features' => ['max_products' => 50], 'max_users' => 2, 'max_businesses' => 1, 'is_active' => true]);
        $pro = Plan::firstOrCreate(['code' => 'PRO'], ['name' => 'Pro', 'description' => 'Pro plan', 'monthly_price' => 99000, 'yearly_price' => 990000, 'features' => ['max_products' => -1], 'max_users' => 20, 'max_businesses' => 5, 'is_active' => true]);

        $admin = User::firstOrCreate(['email' => 'admin@umkmpro.test'], ['name' => 'System Admin', 'password' => Hash::make('password'), 'email_verified_at' => now()]);
        $admin->assignRole('owner');

        $business = Business::firstOrCreate(['slug' => 'demo-business'], ['owner_id' => $admin->id, 'name' => 'Demo Business', 'industry' => 'Retail', 'phone' => '08123456789', 'email' => 'demo@umkmpro.test', 'address' => 'Jl. Demo No. 1, Jakarta', 'settings' => ['currency' => 'IDR', 'timezone' => 'Asia/Jakarta'], 'status' => 'active']);
        if (! $business->users()->where('user_id', $admin->id)->exists()) {
            $business->users()->attach($admin->id, ['role' => 'owner']);
        }

        if (! $business->subscriptions()->where('status', 'active')->exists()) {
            $business->subscriptions()->create(['plan_id' => $pro->id, 'status' => 'active', 'starts_at' => now(), 'ends_at' => now()->addYear()]);
        }

        $category = Category::firstOrCreate(['business_id' => $business->id, 'slug' => 'default'], ['name' => 'Umum', 'description' => 'Kategori default']);
        Product::firstOrCreate(['business_id' => $business->id, 'sku' => 'DEMO-001'], ['category_id' => $category->id, 'name' => 'Produk Demo', 'description' => 'Ini adalah produk contoh.', 'cost_price' => 8000, 'selling_price' => 10000, 'stock' => 100, 'min_stock' => 10, 'is_active' => true]);
        Customer::firstOrCreate(['business_id' => $business->id, 'email' => 'pelanggan@demo.test'], ['name' => 'Pelanggan Demo', 'phone' => '08111111111']);
        Supplier::firstOrCreate(['business_id' => $business->id, 'name' => 'Supplier Demo'], ['phone' => '08222222222', 'email' => 'supplier@demo.test']);

        $this->call([
            CashSeeder::class,
        ]);

        $this->command->info('✅ Seeder selesai. Login: admin@umkmpro.test / password');
    }
}
