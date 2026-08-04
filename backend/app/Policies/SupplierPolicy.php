<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('suppliers.view', $business);
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionInBusiness('suppliers.view', $supplier->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('suppliers.create', $business);
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionInBusiness('suppliers.update', $supplier->business);
    }
}
