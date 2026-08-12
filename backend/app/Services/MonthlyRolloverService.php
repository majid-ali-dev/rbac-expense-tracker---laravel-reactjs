<?php

namespace App\Services;

use App\Models\BillingCycle;
use App\Models\Expense;
use App\Models\MemberDue;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class MonthlyRolloverService
{
    /**
     * Close the current open cycle and start a new one.
     *
     * The closed range is [startDate, endDate]; when omitted it defaults to the
     * cycle's own start date -> today. Everything runs inside one transaction
     * guarded by a row lock on the open cycle, so concurrent/double closes are
     * prevented and a failure rolls back the whole operation.
     */
    public function closeCurrentAndStartNext(
        ?int $closedByUserId = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        ?int $expectedCycleId = null
    ): BillingCycle {
        return DB::transaction(function () use ($closedByUserId, $startDate, $endDate, $expectedCycleId) {
            // Row lock: a concurrent close request will block here, then
            // re-read the row — by then status is 'closed', so it returns null.
            $current = BillingCycle::where('status', 'open')
                ->lockForUpdate()
                ->latest('start_date')
                ->first();

            if (!$current) {
                abort(409, 'No active billing cycle to close.');
            }

            if ($expectedCycleId && (int) $current->id !== (int) $expectedCycleId) {
                abort(409, 'This billing cycle has already been closed. Please refresh and try again.');
            }

            $closeStart = $startDate ? $startDate->copy()->startOfDay() : $current->start_date->copy();
            $closeEnd = $endDate ? $endDate->copy()->startOfDay() : Carbon::now()->startOfDay();

            if ($closeStart->gt($closeEnd)) {
                throw ValidationException::withMessages([
                    'start_date' => 'Start date cannot be after the end date.',
                ]);
            }

            if ($closeEnd->gt(Carbon::now()->endOfDay())) {
                throw ValidationException::withMessages([
                    'end_date' => 'End date cannot be in the future.',
                ]);
            }

            // 1. Snapshot totals for the SELECTED date range (not the whole cycle)
            $totalExpense = Expense::whereBetween('date', [
                $closeStart->format('Y-m-d'),
                $closeEnd->format('Y-m-d'),
            ])->sum('amount');

            $totalPaid = Payment::where('billing_cycle_id', $current->id)
                ->sum('paid_amount');

            // 2. Seal the closed cycle with its ACTUAL selected range
            $current->update([
                'start_date' => $closeStart,
                'end_date' => $closeEnd,
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $closedByUserId ?? Auth::id(),
                'total_expense' => $totalExpense,
                'total_paid' => $totalPaid,
            ]);

            // 3. Attach every expense inside the closed range to this cycle.
            //    (Expenses dated AFTER the close end stay in the new cycle —
            //    they must never be captured by the cycle being closed.)
            Expense::whereBetween('date', [
                $closeStart->format('Y-m-d'),
                $closeEnd->format('Y-m-d'),
            ])->update(['billing_cycle_id' => $current->id]);

            // 4. Snapshot each member's due: assigned amount (from the due row
            //    or the legacy users.total_amount fallback) + paid amount.
            $members = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->get();

            foreach ($members as $member) {
                $paidAmount = (float) Payment::where('user_id', $member->id)
                    ->where('billing_cycle_id', $current->id)
                    ->sum('paid_amount');

                $assigned = (float) (MemberDue::where('user_id', $member->id)
                    ->where('billing_cycle_id', $current->id)
                    ->value('amount_assigned') ?? $member->total_amount ?? 0);

                MemberDue::updateOrCreate(
                    ['user_id' => $member->id, 'billing_cycle_id' => $current->id],
                    ['amount_assigned' => $assigned, 'amount_paid' => $paidAmount]
                );
            }

            // 5. Start the new cycle the day after the selected close end
            $nextStart = $closeEnd->copy()->addDay()->startOfDay();
            $nextEnd = $nextStart->copy()->addDays(30)->endOfDay();

            $newCycle = BillingCycle::create([
                'label' => $nextStart->format('F Y') . ' (Cycle ' . ($current->id + 1) . ')',
                'start_date' => $nextStart,
                'end_date' => $nextEnd,
                'status' => 'open',
                'total_expense' => 0,
                'total_paid' => 0,
            ]);

            // 6. Any expense dated after the closed range (including records
            //    that were previously assigned to the closing cycle) belongs to
            //    the new cycle — nothing may be lost between ranges.
            Expense::where('date', '>', $closeEnd->format('Y-m-d'))
                ->where(function ($q) use ($current) {
                    $q->whereNull('billing_cycle_id')
                        ->orWhere('billing_cycle_id', $current->id);
                })
                ->update(['billing_cycle_id' => $newCycle->id]);

            // 7. Reset members for the new cycle (operational values only —
            //    historical amounts live in member_dues for the closed cycle).
            foreach ($members as $member) {
                $member->update([
                    'status' => 'unpaid',
                    'total_amount' => 0,
                ]);

                MemberDue::create([
                    'user_id' => $member->id,
                    'billing_cycle_id' => $newCycle->id,
                    'amount_assigned' => 0,
                    'amount_paid' => 0,
                ]);
            }

            return $newCycle;
        });
    }

    public function createCustomCycle(
        Carbon $startDate,
        Carbon $endDate,
        ?int $closedByUserId = null
    ): BillingCycle {
        return DB::transaction(function () use ($startDate, $endDate, $closedByUserId) {
            $current = BillingCycle::where('status', 'open')->first();
            if ($current) {
                $current->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                    'closed_by' => $closedByUserId ?? Auth::id(),
                ]);
            }

            $newCycle = BillingCycle::create([
                'label' => $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'open',
                'total_expense' => 0,
                'total_paid' => 0,
            ]);

            $members = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->get();
            foreach ($members as $member) {
                $member->update(['status' => 'unpaid']);

                MemberDue::create([
                    'user_id' => $member->id,
                    'billing_cycle_id' => $newCycle->id,
                    'amount_assigned' => 0,
                    'amount_paid' => 0,
                ]);
            }

            return $newCycle;
        });
    }
}
