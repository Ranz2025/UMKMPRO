<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Purchase;
use App\Models\User;

class PurchasePolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('purchases.view', $business);
    }

    public function view(User $user, Purchase $purchase): bool
    {
        return $user->hasPermissionInBusiness('purchases.view', $purchase->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('purchases.create', $business);
    }

    public function update(User $user, Purchase $purchase): bool
    {
        return $user->hasPermissionInBusiness('purchases.update', $purchase->business);
    }
}
