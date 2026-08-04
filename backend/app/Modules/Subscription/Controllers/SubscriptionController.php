<?php

namespace App\Modules\Subscription\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SubscriptionController extends Controller
{
    /**
     * Daftar semua plan yang tersedia (Cached).
     */
    public function plans(): JsonResponse
    {
        $plans = Cache::remember('plans:active', 21600, function () {
            return Plan::where('is_active', true)
                ->orderBy('monthly_price')
                ->get([
                    'id', 'name', 'code', 'monthly_price', 'yearly_price',
                    'max_users', 'max_businesses', 'features', 'is_active',
                ]);
        });

        return response()->json([
            'success' => true,
            'data'    => $plans,
        ]);
    }

    /**
     * Status subscription business yang aktif.
     */
    public function status(Request $request): JsonResponse
    {
        $business = app('current.business');

        $subscription = $business->activeSubscription()->with('plan')->first();

        if (! $subscription) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'status'  => 'inactive',
                    'message' => 'Tidak ada subscription aktif.',
                    'plan'    => null,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'status'       => $subscription->status,
                'starts_at'    => $subscription->starts_at,
                'ends_at'      => $subscription->ends_at,
                'is_expired'   => $subscription->ends_at && now()->isAfter($subscription->ends_at),
                'days_left'    => $subscription->ends_at
                    ? max(0, now()->diffInDays($subscription->ends_at, false))
                    : null,
                'plan'         => $subscription->plan ? [
                    'id'            => $subscription->plan->id,
                    'name'          => $subscription->plan->name,
                    'code'          => $subscription->plan->code,
                    'monthly_price' => $subscription->plan->monthly_price,
                    'yearly_price'  => $subscription->plan->yearly_price,
                    'max_users'     => $subscription->plan->max_users,
                    'max_businesses'=> $subscription->plan->max_businesses,
                    'features'      => $subscription->plan->features,
                ] : null,
            ],
        ]);
    }

    /**
     * Riwayat subscription business.
     */
    public function history(Request $request): JsonResponse
    {
        $business = app('current.business');

        $subscriptions = Subscription::where('business_id', $business->id)
            ->with('plan:id,name,code,monthly_price,yearly_price')
            ->latest()
            ->paginate((int) $request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data'    => $subscriptions->items(),
            'meta'    => [
                'current_page' => $subscriptions->currentPage(),
                'per_page'     => $subscriptions->perPage(),
                'total'        => $subscriptions->total(),
                'last_page'    => $subscriptions->lastPage(),
            ],
        ]);
    }

    /**
     * Upgrade / ganti plan.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id'       => ['required', 'integer', 'exists:plans,id'],
            'billing_cycle' => ['nullable', 'in:monthly,yearly'],
        ]);

        $business = app('current.business');

        // Hanya owner yang bisa ganti plan
        $user   = $request->user();
        $member = $business->users()->where('user_id', $user->id)->first();

        if (! $member || $member->pivot->role !== 'owner') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya owner yang dapat mengubah subscription.',
            ], 403);
        }

        $plan = Plan::findOrFail($request->plan_id);

        // Nonaktifkan subscription lama
        Subscription::where('business_id', $business->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        // Buat subscription baru
        $billingCycle = $request->get('billing_cycle', 'monthly');
        $endsAt       = $billingCycle === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        // Plan FREE tidak ada masa expired
        if ($plan->code === 'FREE') {
            $endsAt = now()->addYears(100);
        }

        $subscription = Subscription::create([
            'business_id' => $business->id,
            'plan_id'     => $plan->id,
            'status'      => 'active',
            'starts_at'   => now(),
            'ends_at'     => $endsAt,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil berlangganan plan {$plan->name}.",
            'data'    => [
                'subscription' => $subscription->load('plan'),
                'plan'         => $plan,
            ],
        ], 201);
    }

    /**
     * Cancel subscription (turun ke FREE).
     */
    public function cancel(Request $request): JsonResponse
    {
        $business = app('current.business');

        $user   = $request->user();
        $member = $business->users()->where('user_id', $user->id)->first();

        if (! $member || $member->pivot->role !== 'owner') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya owner yang dapat membatalkan subscription.',
            ], 403);
        }

        // Batalkan subscription aktif
        Subscription::where('business_id', $business->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        // Kembalikan ke FREE plan
        $freePlan = Plan::where('code', 'FREE')->first();
        if ($freePlan) {
            Subscription::create([
                'business_id' => $business->id,
                'plan_id'     => $freePlan->id,
                'status'      => 'active',
                'starts_at'   => now(),
                'ends_at'     => now()->addYears(100),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscription dibatalkan. Business kembali ke plan FREE.',
        ]);
    }
}
