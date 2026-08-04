<?php

namespace Database\Factories;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(10000, 500000);
        $discount = fake()->numberBetween(0, (int) ($subtotal * 0.1));
        $tax      = 0;
        $grand    = $subtotal - $discount + $tax;

        return [
            'business_id'     => null, // diisi saat factory->for(Business) dipanggil
            'customer_id'     => null,
            'user_id'         => null,
            'invoice_number'  => 'INV-' . now()->format('Ymd') . '-' . Str::upper(fake()->unique()->bothify('????')),
            'subtotal'        => $subtotal,
            'discount_amount' => $discount,
            'tax_amount'      => $tax,
            'grand_total'     => $grand,
            'status'          => fake()->randomElement(['draft', 'paid', 'cancelled']),
            'sold_at'         => fake()->dateTimeBetween('-30 days', 'now'),
            'meta'            => [],
        ];
    }

    /** State: status paid */
    public function paid(): static
    {
        return $this->state(fn () => ['status' => 'paid']);
    }
}
