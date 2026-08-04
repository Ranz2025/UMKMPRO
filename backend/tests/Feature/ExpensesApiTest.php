<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Expense;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ExpensesApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('owner', 'web');
        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->business = Business::factory()->create(['owner_id' => $this->user->id]);
        $this->business->users()->attach($this->user, ['role' => 'owner']);
        $this->user->assignRole('owner');

        $plan = Plan::factory()->create();
        Subscription::factory()->create([
            'business_id' => $this->business->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
        ]);
    }

    public function test_can_list_expenses(): void
    {
        Expense::create([
            'business_id' => $this->business->id,
            'user_id' => $this->user->id,
            'category' => 'Listrik & Air',
            'title' => 'PLN Agustus',
            'amount' => 450000,
            'expense_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->getJson('/api/v1/expenses');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_can_create_expense(): void
    {
        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->postJson('/api/v1/expenses', [
                'category' => 'Sewa',
                'title' => 'Sewa Ruko Agustus',
                'amount' => 1500000,
                'expense_date' => now()->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data']);

        $this->assertDatabaseHas('expenses', [
            'business_id' => $this->business->id,
            'title' => 'Sewa Ruko Agustus',
        ]);
    }
}
