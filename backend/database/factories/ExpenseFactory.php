<?php

namespace Database\Factories;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'business_id'  => null,
            'user_id'      => null,
            'category'     => fake()->randomElement(['gaji', 'sewa', 'utilitas', 'marketing', 'operasional', 'lainnya']),
            'title'        => fake()->sentence(4),
            'amount'       => fake()->numberBetween(10000, 5000000),
            'expense_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'notes'        => fake()->optional()->sentence(),
        ];
    }
}
