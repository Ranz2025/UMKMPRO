<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('expenses.view', $business);
    }

    public function view(User $user, Expense $expense): bool
    {
        return $user->hasPermissionInBusiness('expenses.view', $expense->business);
    }

    public function create(User $user, Business $business): bool
    {
        return $user->hasPermissionInBusiness('expenses.manage', $business);
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->hasPermissionInBusiness('expenses.manage', $expense->business);
    }
}
