<?php

namespace App\Http\Controllers;

use App\Models\BillingCycle;
use App\Services\MonthlyRolloverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

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
     * GET /api/billing-cycle/all
     * All cycles (no pagination) — used by the reusable cycle filter dropdown.
     */
    public function all(): JsonResponse
    {
        $cycles = BillingCycle::orderByDesc('start_date')->get();

        return response()->json([
            'success' => true,
            'data' => $cycles,
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
     *
     * Closes the current open cycle using the user-selected date range. The
     * selected range becomes the cycle's actual sealed range; data after the
     * end date stays available in the next cycle.
     *
     * start_date/end_date are REQUIRED: the exact dates chosen in the UI must
     * be stored verbatim — the API never falls back to the current/system date,
     * so an accidental or malformed close can never seal "today" into the DB.
     */
    public function closeCurrentMonth(Request $request, MonthlyRolloverService $service): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date'],
                // Required: prevents a stale/concurrent request from closing the
                // freshly-created next cycle instead of the intended one.
                'cycle_id' => ['required', 'integer', 'exists:billing_cycles,id'],
            ]);

            $newCycle = $service->closeCurrentAndStartNext(
                auth()->id(),
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date']),
                $validated['cycle_id']
            );

            return response()->json([
                'success' => true,
                'message' => "Month closed successfully. New billing cycle started: {$newCycle->label}",
                'data' => $newCycle,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
