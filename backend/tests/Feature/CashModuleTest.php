<?php

namespace Tests\Feature;

use App\Models\BankAccount;
use App\Models\Business;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CashModuleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('owner', 'web');
        $plan = Plan::firstOrCreate(['code' => 'PRO'], ['name' => 'Pro', 'monthly_price' => 99000, 'yearly_price' => 990000, 'features' => [], 'max_users' => 20, 'max_businesses' => 5, 'is_active' => true]);

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->business = Business::factory()->create(['owner_id' => $this->user->id]);
        $this->business->users()->attach($this->user, ['role' => 'owner']);
        $this->business->subscriptions()->create(['plan_id' => $plan->id, 'status' => 'active', 'starts_at' => now(), 'ends_at' => now()->addMonth()]);
        $this->user->assignRole('owner');
    }

    public function test_can_list_and_seed_cash_accounts(): void
    {
        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->getJson('/api/v1/cash/accounts');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $this->assertDatabaseHas('bank_accounts', [
            'business_id' => $this->business->id,
            'type' => 'cash',
        ]);
    }

    public function test_can_create_cash_transaction_and_update_balance(): void
    {
        $account = BankAccount::create([
            'business_id' => $this->business->id,
            'name' => 'Kas Toko Utama',
            'bank_name' => 'Kas Tunai',
            'type' => 'cash',
            'opening_balance' => 100000,
            'current_balance' => 100000,
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->postJson('/api/v1/cash/transactions', [
                'bank_account_id' => $account->id,
                'type' => 'in',
                'amount' => 50000,
                'category' => 'Penjualan',
                'notes' => 'Kasir Sesi 1',
                'transaction_date' => now()->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data']);

        $this->assertEquals(150000, $account->fresh()->current_balance);
    }
}
