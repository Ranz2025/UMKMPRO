<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessFactory extends Factory
{
    protected $model = Business::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'industry' => fake()->randomElement(['Retail', 'F&B', 'Services']),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'address' => fake()->address(),
            'settings' => ['currency' => 'IDR'],
            'status' => 'active',
        ];
    }
}
