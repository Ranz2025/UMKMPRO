<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $business = app('current.business');

        $suppliers = Supplier::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->orderBy('name')
            ->get();

        return ApiResponse::success($suppliers, 'Daftar supplier');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $business = app('current.business');

        $supplier = Supplier::create([
            ...$data,
            'business_id' => $business->id,
        ]);

        return ApiResponse::success($supplier, 'Supplier berhasil dibuat', 201);
    }
}
