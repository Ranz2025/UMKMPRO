<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $businesses = $request->user()
            ->businesses()
            ->withPivot('role')
            ->get()
            ->map(fn ($b) => [
                'id'       => $b->id,
                'name'     => $b->name,
                'slug'     => $b->slug,
                'industry' => $b->industry,
                'role'     => $b->pivot->role,
                'status'   => $b->status,
            ]);

        return response()->json(['success' => true, 'data' => $businesses]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'industry' => 'nullable|string|max:100',
            'phone'    => 'nullable|string|max:20',
            'email'    => 'nullable|email|max:255',
            'address'  => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['name']);
        $base = $slug;
        $i    = 1;
        while (Business::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $business = Business::create([
            ...$validated,
            'slug'     => $slug,
            'owner_id' => $request->user()->id,
            'status'   => 'active',
            'settings' => ['currency' => 'IDR', 'timezone' => 'Asia/Jakarta'],
        ]);

        $business->users()->attach($request->user()->id, ['role' => 'owner']);

        // Berikan plan Free secara default
        $freePlan = \App\Models\Plan::where('code', 'FREE')->first();
        if ($freePlan) {
            $business->subscriptions()->create([
                'plan_id'    => $freePlan->id,
                'status'     => 'active',
                'starts_at'  => now(),
                'ends_at'    => now()->addYears(100),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bisnis berhasil dibuat.',
            'data'    => [
                'id'       => $business->id,
                'name'     => $business->name,
                'slug'     => $business->slug,
                'industry' => $business->industry,
                'role'     => 'owner',
                'status'   => $business->status,
            ],
        ], 201);
    }

    public function show(Request $request, Business $business): JsonResponse
    {
        $this->authorizeBusinessAccess($request, $business);

        return response()->json([
            'success' => true,
            'data'    => $business->load('activeSubscription.plan'),
        ]);
    }

    public function update(Request $request, Business $business): JsonResponse
    {
        $this->authorizeBusinessAccess($request, $business);

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'industry' => 'nullable|string|max:100',
            'phone'    => 'nullable|string|max:20',
            'email'    => 'nullable|email|max:255',
            'address'  => 'nullable|string|max:500',
        ]);

        $business->update($validated);

        return response()->json(['success' => true, 'message' => 'Bisnis diperbarui.', 'data' => $business->fresh()]);
    }

    public function destroy(Request $request, Business $business): JsonResponse
    {
        $this->authorizeBusinessAccess($request, $business, ownerOnly: true);
        $business->delete();
        return response()->json(['success' => true, 'message' => 'Bisnis dihapus.']);
    }

    public function switch(Request $request, Business $business): JsonResponse
    {
        $this->authorizeBusinessAccess($request, $business);
        return response()->json(['success' => true, 'data' => ['business_id' => $business->id]]);
    }

    private function authorizeBusinessAccess(Request $request, Business $business, bool $ownerOnly = false): void
    {
        $user = $request->user();
        $member = $business->users()->where('user_id', $user->id)->first();

        if (! $member) {
            abort(403, 'Anda tidak memiliki akses ke bisnis ini.');
        }

        if ($ownerOnly && $member->pivot->role !== 'owner') {
            abort(403, 'Hanya owner yang dapat melakukan aksi ini.');
        }
    }
}
