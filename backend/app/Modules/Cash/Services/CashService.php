<?php

namespace App\Modules\Cash\Services;

use App\Models\BankAccount;
use App\Models\CashTransaction;
use App\Support\BaseService;
use Illuminate\Support\Facades\DB;

class CashService extends BaseService
{
    public function getAccounts()
    {
        $accounts = BankAccount::orderBy('id', 'asc')->get();

        if ($accounts->isEmpty()) {
            // Seed default Kas Utama if none exists
            $businessId = auth()->user()?->active_business_id ?? request()->header('X-Business-Id');
            if ($businessId) {
                $accounts = collect([
                    BankAccount::create([
                        'business_id' => $businessId,
                        'name' => 'Kas Tunai / Kasir',
                        'bank_name' => 'Kas Tunai',
                        'type' => 'cash',
                        'opening_balance' => 0,
                        'current_balance' => 0,
                    ]),
                    BankAccount::create([
                        'business_id' => $businessId,
                        'name' => 'Bank BCA Utama',
                        'bank_name' => 'BCA',
                        'account_number' => '8801928374',
                        'type' => 'bank',
                        'opening_balance' => 0,
                        'current_balance' => 0,
                    ]),
                ]);
            }
        }

        return $accounts;
    }

    public function createAccount(array $data): BankAccount
    {
        $businessId = request()->header('X-Business-Id');
        $initial = $data['opening_balance'] ?? 0;

        return BankAccount::create([
            'business_id' => $businessId,
            'name' => $data['name'],
            'bank_name' => $data['bank_name'] ?? 'Kas',
            'account_number' => $data['account_number'] ?? null,
            'type' => $data['type'] ?? 'cash',
            'opening_balance' => $initial,
            'current_balance' => $initial,
        ]);
    }

    public function getTransactions(array $filters = [])
    {
        $query = CashTransaction::with(['bankAccount', 'toBankAccount'])
            ->orderBy('id', 'desc');

        if (!empty($filters['bank_account_id'])) {
            $query->where('bank_account_id', $filters['bank_account_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate(20);
    }

    public function createTransaction(array $data): CashTransaction
    {
        return DB::transaction(function () use ($data) {
            $businessId = request()->header('X-Business-Id');
            $account = BankAccount::findOrFail($data['bank_account_id']);
            $amount = (float) $data['amount'];
            $type = $data['type']; // in, out, transfer

            if ($type === 'out') {
                $account->decrement('current_balance', $amount);
            } elseif ($type === 'in') {
                $account->increment('current_balance', $amount);
            } elseif ($type === 'transfer') {
                $toAccount = BankAccount::findOrFail($data['to_bank_account_id']);
                $account->decrement('current_balance', $amount);
                $toAccount->increment('current_balance', $amount);
            }

            return CashTransaction::create([
                'business_id' => $businessId,
                'bank_account_id' => $account->id,
                'to_bank_account_id' => $data['to_bank_account_id'] ?? null,
                'user_id' => auth()->id(),
                'type' => $type,
                'amount' => $amount,
                'category' => $data['category'] ?? 'Operasional',
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'] ?? now()->toDateString(),
            ]);
        });
    }
}
