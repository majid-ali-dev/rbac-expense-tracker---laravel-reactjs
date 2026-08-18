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
     * POST /api/billing-cycle
     *
     * Create a new billing cycle with the exact start/end dates provided. The
     * current open cycle (if any) is closed and the new cycle becomes active.
     */
    public function store(Request $request, MonthlyRolloverService $service): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            ]);

            $cycle = $service->createCustomCycle(
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date'])
            );

            return response()->json([
                'success' => true,
                'message' => "Billing cycle created successfully: {$cycle->label}",
                'data' => $cycle,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * PUT /api/billing-cycle/{id}
     *
     * Update a cycle's start/end dates (open OR closed — historical cycles
     * stay editable for admins).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $cycle = BillingCycle::find($id);

        if (!$cycle) {
            return response()->json([
                'success' => false,
                'message' => 'Billing cycle not found.',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            ]);

            $cycle->update([
                'start_date' => Carbon::parse($validated['start_date'])->startOfDay(),
                'end_date' => Carbon::parse($validated['end_date'])->startOfDay(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Billing cycle updated successfully.',
                'data' => $cycle->fresh(),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors' => $e->errors(),
            ], 422);
        }
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
