<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('PLAN-###'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'monthly_price' => 50000,
            'yearly_price' => 500000,
            'features' => ['users' => 3],
            'max_users' => 3,
            'max_businesses' => 1,
            'is_active' => true,
        ];
    }
}
