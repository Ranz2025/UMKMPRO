<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('products.view', $business);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasPermissionInBusiness('products.view', $product->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('products.create', $business);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermissionInBusiness('products.update', $product->business);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermissionInBusiness('products.delete', $product->business);
    }
}
