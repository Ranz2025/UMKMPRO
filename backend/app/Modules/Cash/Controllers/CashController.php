<?php

namespace App\Modules\Cash\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Cash\Services\CashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashController extends Controller
{
    public function __construct(
        private readonly CashService $service
    ) {}

    public function getAccounts(): JsonResponse
    {
        $accounts = $this->service->getAccounts();

        return response()->json([
            'success' => true,
            'message' => 'Daftar akun kas & bank berhasil dimuat',
            'data'    => $accounts,
        ]);
    }

    public function createAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:100',
            'type' => 'required|in:cash,bank,e-wallet',
            'opening_balance' => 'nullable|numeric|min:0',
        ]);

        $account = $this->service->createAccount($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun kas/bank berhasil dibuat',
            'data'    => $account,
        ], 201);
    }

    public function getTransactions(Request $request): JsonResponse
    {
        $transactions = $this->service->getTransactions($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Daftar mutasi transaksi berhasil dimuat',
            'data'    => $transactions,
        ]);
    }

    public function createTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'to_bank_account_id' => 'required_if:type,transfer|nullable|exists:bank_accounts,id',
            'type' => 'required|in:in,out,transfer',
            'amount' => 'required|numeric|gt:0',
            'category' => 'required|string|max:100',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        $tx = $this->service->createTransaction($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi kas berhasil dicatat',
            'data'    => $tx,
        ], 201);
    }
}
