<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('customers.view', $business);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->hasPermissionInBusiness('customers.view', $customer->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('customers.create', $business);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasPermissionInBusiness('customers.update', $customer->business);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasPermissionInBusiness('customers.delete', $customer->business);
    }
}
