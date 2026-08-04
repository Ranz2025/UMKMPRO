<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Sale;
use App\Models\User;

class SalePolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('sales.view', $business);
    }

    public function view(User $user, Sale $sale): bool
    {
        return $user->hasPermissionInBusiness('sales.view', $sale->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('sales.create', $business);
    }

    public function update(User $user, Sale $sale): bool
    {
        return $user->hasPermissionInBusiness('sales.update', $sale->business);
    }

    public function delete(User $user, Sale $sale): bool
    {
        return $user->hasPermissionInBusiness('sales.delete', $sale->business);
    }
}
