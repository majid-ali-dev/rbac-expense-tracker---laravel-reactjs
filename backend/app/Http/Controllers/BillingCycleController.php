<?php

namespace App\Http\Controllers;

use App\Models\BillingCycle;
use App\Services\MonthlyRolloverService;
use Illuminate\Http\JsonResponse;

class BillingCycleController extends Controller
{
    /**
     * GET /api/billing-cycle/current
     */
    public function current(): JsonResponse
    {
        $cycle = BillingCycle::current();

        return response()->json([
            'success' => true,
            'data' => $cycle,
        ]);
    }

    /**
     * GET /api/billing-cycle/history
     */
    public function history(): JsonResponse
    {
        $cycles = BillingCycle::orderByDesc('start_date')->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $cycles,
        ]);
    }

    /**
     * POST /api/billing-cycle/close
     */
    public function closeCurrentMonth(MonthlyRolloverService $service): JsonResponse
    {
        $user = auth()->user();

        if (!$user->hasRole('manager') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to close the billing month.',
            ], 403);
        }

        $newCycle = $service->closeCurrentAndStartNext($user->id);

        return response()->json([
            'success' => true,
            'message' => "Month closed successfully. New billing cycle started: {$newCycle->label}",
            'data' => $newCycle,
        ]);
    }
}
