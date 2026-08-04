<?php

namespace App\Modules\Supplier\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $suppliers = Supplier::query()
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->latest()->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $suppliers->items(),
            'meta'    => ['current_page' => $suppliers->currentPage(), 'per_page' => $suppliers->perPage(), 'total' => $suppliers->total(), 'last_page' => $suppliers->lastPage()],
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
        $supplier = Supplier::create($data);
        return response()->json(['success' => true, 'message' => 'Supplier ditambahkan.', 'data' => $supplier], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Supplier::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);
        $supplier->update($data);
        return response()->json(['success' => true, 'message' => 'Supplier diperbarui.', 'data' => $supplier->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Supplier::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Supplier dihapus.']);
    }
}
