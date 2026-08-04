<?php

namespace Database\Factories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        $startsAt = now();
        $endsAt   = now()->addMonth();

        return [
            'business_id'   => null,
            'plan_id'       => null,
            'status'        => 'active',
            'starts_at'     => $startsAt,
            'ends_at'       => $endsAt,
            'trial_ends_at' => null,
            'cancelled_at'  => null,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status'   => 'active',
            'starts_at'=> now()->subMonth(),
            'ends_at'  => now()->subDay(),
        ]);
    }

    public function trialing(): static
    {
        return $this->state(fn () => [
            'status'        => 'active',
            'trial_ends_at' => now()->addDays(14),
            'ends_at'       => null,
        ]);
    }
}
