<?php

namespace Database\Factories;

use App\Models\Purchase;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PurchaseFactory extends Factory
{
    protected $model = Purchase::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(50000, 2000000);
        $tax      = 0;
        $grand    = $subtotal + $tax;

        return [
            'business_id'    => null,
            'supplier_id'    => null,
            'user_id'        => null,
            'invoice_number' => 'PO-' . now()->format('Ymd') . '-' . Str::upper(fake()->unique()->bothify('????')),
            'subtotal'       => $subtotal,
            'tax_amount'     => $tax,
            'grand_total'    => $grand,
            'status'         => fake()->randomElement(['draft', 'received', 'cancelled']),
            'purchased_at'   => fake()->dateTimeBetween('-30 days', 'now'),
            'meta'           => [],
        ];
    }

    public function received(): static
    {
        return $this->state(fn () => ['status' => 'received']);
    }
}
