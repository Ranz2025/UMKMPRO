<?php

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('phone', 'like', '%'.$request->search.'%'))
            ->latest()->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $customers->items(),
            'meta'    => ['current_page' => $customers->currentPage(), 'per_page' => $customers->perPage(), 'total' => $customers->total(), 'last_page' => $customers->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);
        $customer = Customer::create($data);
        return response()->json(['success' => true, 'message' => 'Pelanggan ditambahkan.', 'data' => $customer], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Customer::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);
        $customer->update($data);
        return response()->json(['success' => true, 'message' => 'Pelanggan diperbarui.', 'data' => $customer->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Customer::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Pelanggan dihapus.']);
    }
}
