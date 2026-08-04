<?php

namespace App\Modules\Expense\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $expenses = Expense::query()
            ->when($request->search, fn ($q) => $q->where('title', 'like', '%'.$request->search.'%'))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->when($request->start_date, fn ($q) => $q->whereDate('expense_date', '>=', $request->start_date))
            ->when($request->end_date, fn ($q) => $q->whereDate('expense_date', '<=', $request->end_date))
            ->latest('expense_date')->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $expenses->items(),
            'meta'    => ['current_page' => $expenses->currentPage(), 'per_page' => $expenses->perPage(), 'total' => $expenses->total(), 'last_page' => $expenses->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'category'     => 'required|string|max:100',
            'amount'       => 'required|integer|min:1',
            'expense_date' => 'required|date',
            'notes'        => 'nullable|string',
        ]);
        $data['user_id'] = $request->user()->id;
        $expense = Expense::create($data);
        return response()->json(['success' => true, 'message' => 'Pengeluaran dicatat.', 'data' => $expense], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Expense::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $data = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'category'     => 'sometimes|required|string|max:100',
            'amount'       => 'sometimes|required|integer|min:1',
            'expense_date' => 'sometimes|required|date',
            'notes'        => 'nullable|string',
        ]);
        $expense->update($data);
        return response()->json(['success' => true, 'message' => 'Pengeluaran diperbarui.', 'data' => $expense->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Expense::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Pengeluaran dihapus.']);
    }
}
