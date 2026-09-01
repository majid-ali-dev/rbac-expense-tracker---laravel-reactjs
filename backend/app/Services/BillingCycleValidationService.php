<?php

namespace App\Services;

use App\Models\BillingCycle;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Centralized, reusable validation logic for billing-cycle date rules.
 *
 * Used by every module (Expenses, Payments, …) so the same rules are
 * enforced everywhere without code duplication.
 */
class BillingCycleValidationService
{
    /**
     * Ensure the given entry date falls inside the ACTIVE (open) cycle's range.
     *
     * When a user explicitly selects a CLOSED (historical) cycle via cycle_id,
     * the date validation is intentionally skipped — the user is deliberately
     * editing historical data and the permission system already gates access.
     *
     * @param  int|null  $cycleId   The billing cycle the entry is being written to.
     * @param  string    $entryDate The entry's date in Y-m-d format.
     * @param  string    $context   Human-readable label (e.g. "expense", "payment") for the error message.
     *
     * @throws HttpResponseException 422 when the date is outside the active cycle.
     */
    public function assertDateInCycle(?int $cycleId, string $entryDate, string $context = 'record'): void
    {
        if (!$cycleId || !$entryDate) {
            return;
        }

        $cycle = BillingCycle::find($cycleId);

        if (!$cycle) {
            return;
        }

        // Only enforce date range on the ACTIVE (open) cycle. Closed cycles
        // are historical and explicitly selected — the user intentionally
        // chose that date range.
        if ($cycle->status !== 'open') {
            return;
        }

        $date = Carbon::parse($entryDate)->startOfDay();
        $start = $cycle->start_date->startOfDay();
        $end = $cycle->end_date->startOfDay();

        if ($date->lt($start) || $date->gt($end)) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => "The selected date is outside the active billing cycle. Please create or update the billing cycle before adding this {$context}.",
            ], 422));
        }
    }

    /**
     * When closing a cycle with the given [closeStart, closeEnd] range, verify
     * that NO cycle-related records exist outside that range.
     *
     * Only expenses that are already attributed to this cycle (billing_cycle_id
     * set) are checked. Unattributed expenses are NOT a blocking condition —
     * the close logic still assigns them to the appropriate cycle.
     *
     * @param  BillingCycle  $cycle       The cycle about to be closed.
     * @param  Carbon        $closeStart  The selected close start date.
     * @param  Carbon        $closeEnd    The selected close end date.
     *
     * @throws HttpResponseException 409 when records exist outside the range.
     */
    public function assertNoRecordsOutsideRange(
        BillingCycle $cycle,
        Carbon $closeStart,
        Carbon $closeEnd,
    ): void {
        $start = $closeStart->copy()->startOfDay()->format('Y-m-d');
        $end = $closeEnd->copy()->startOfDay()->format('Y-m-d');

        // Expenses assigned to this cycle but dated outside the close range
        $outsideExpenses = Expense::where('billing_cycle_id', $cycle->id)
            ->where(function ($q) use ($start, $end) {
                $q->whereDate('date', '<', $start)
                    ->orWhereDate('date', '>', $end);
            })
            ->count();

        if ($outsideExpenses > 0) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => "This cycle cannot be closed because {$outsideExpenses} expense(s) exist outside its date range. Please create/update the billing cycle or correct the record dates first.",
            ], 409));
        }
    }
}
