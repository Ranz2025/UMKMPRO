<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $business = app('current.business');

        $customers = Customer::query()
            ->when($business, fn ($query) => $query->where('business_id', $business->id))
            ->orderBy('name')
            ->get();

        return ApiResponse::success($customers, 'Daftar pelanggan');
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

        $customer = Customer::create([
            ...$data,
            'business_id' => $business->id,
            'meta' => null,
        ]);

        return ApiResponse::success($customer, 'Pelanggan berhasil dibuat', 201);
    }
}
