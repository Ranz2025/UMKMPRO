<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $businesses = $request->user()->businesses()->orderBy('name')->get();

        return ApiResponse::success($businesses, 'Daftar business');
    }

    public function show(Request $request, Business $business): JsonResponse
    {
        abort_unless($request->user()->businesses()->whereKey($business->id)->exists(), 404);

        return ApiResponse::success($business->load(['owner', 'users']), 'Detail business');
    }
}
