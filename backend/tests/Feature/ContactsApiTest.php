<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactsApiTest extends TestCase
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

    public function test_can_manage_customers(): void
    {
        // Create Customer
        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->postJson('/api/v1/customers', [
                'name' => 'Budi Santoso',
                'phone' => '08123456789',
                'email' => 'budi@example.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data']);

        $customerId = $response->json('data.id');

        // List Customers
        $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->getJson('/api/v1/customers')
            ->assertStatus(200);

        // Delete Customer
        $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->deleteJson("/api/v1/customers/{$customerId}")
            ->assertStatus(200);
    }

    public function test_can_manage_suppliers(): void
    {
        // Create Supplier
        $response = $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->postJson('/api/v1/suppliers', [
                'name' => 'CV. Bintang Agro',
                'phone' => '08987654321',
                'email' => 'supplier@bintang.com',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data']);

        $supplierId = $response->json('data.id');

        // List Suppliers
        $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->getJson('/api/v1/suppliers')
            ->assertStatus(200);

        // Delete Supplier
        $this->actingAs($this->user)
            ->withHeader('X-Business-Id', $this->business->id)
            ->deleteJson("/api/v1/suppliers/{$supplierId}")
            ->assertStatus(200);
    }
}
