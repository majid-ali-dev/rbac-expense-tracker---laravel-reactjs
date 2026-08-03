<?php

namespace App\Services;

use App\Models\BillingCycle;
use App\Models\Expense;
use App\Models\MemberDue;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MonthlyRolloverService
{
    public function closeCurrentAndStartNext(?int $closedByUserId = null): BillingCycle
    {
        return DB::transaction(function () use ($closedByUserId) {
            $current = BillingCycle::current();

            // 1. Calculate total expense for this cycle
            $totalExpense = Expense::whereBetween('date', [
                $current->start_date->format('Y-m-d'),
                $current->end_date->format('Y-m-d')
            ])->sum('amount');

            // 2. Calculate total paid for this cycle
            $totalPaid = Payment::where('billing_cycle_id', $current->id)
                ->sum('paid_amount');

            // 3. Close current cycle with all data
            $current->update([
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $closedByUserId ?? Auth::id(),
                'total_expense' => $totalExpense,
                'total_paid' => $totalPaid,
            ]);

            // 4. Update all member dues with amount_paid
            $members = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->get();

            foreach ($members as $member) {
                $paidAmount = Payment::where('user_id', $member->id)
                    ->where('billing_cycle_id', $current->id)
                    ->sum('paid_amount');

                // Update existing MemberDue with paid amount
                MemberDue::where('user_id', $member->id)
                    ->where('billing_cycle_id', $current->id)
                    ->update([
                        'amount_paid' => $paidAmount
                    ]);
            }

            //  5. Create new cycle
            $nextStart = now()->addDay()->startOfDay();
            $nextEnd = $nextStart->copy()->addDays(30)->endOfDay();

            $newCycle = BillingCycle::create([
                'label' => $nextStart->format('F Y') . ' (Cycle ' . ($current->id + 1) . ')',
                'start_date' => $nextStart,
                'end_date' => $nextEnd,
                'status' => 'open',
                'total_expense' => 0,
                'total_paid' => 0,
            ]);

            // 6. Reset members for new cycle
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
