<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateCustomerStatsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries = 3;

    public function __construct(public int $customerId) {}

    public function handle(): void
    {
        $customer = Customer::find($this->customerId);
        if (! $customer) {
            return;
        }

        $totalSpent = Sale::where('customer_id', $this->customerId)
            ->where('status', 'paid')
            ->sum('grand_total');

        $totalOrders = Sale::where('customer_id', $this->customerId)
            ->where('status', 'paid')
            ->count();

        $customer->update([
            'total_spent'  => $totalSpent,
            'total_orders' => $totalOrders,
        ]);
    }
}
