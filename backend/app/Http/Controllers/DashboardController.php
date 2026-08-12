<?php

namespace App\Http\Controllers;

use App\Models\BillingCycle;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            return $this->buildDashboardResponse($request);
        } catch (\Illuminate\Database\QueryException $e) {
            // Database not ready (e.g. migrations missing) — give a readable
            // message instead of a raw SQL dump.
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Dashboard data is unavailable. Please make sure the database is set up correctly and try again.',
            ], 500);
        }
    }

    private function buildDashboardResponse(Request $request): JsonResponse
    {
        $user = auth()->user();
        $permissions = $user->permissions();
        $roleNames = $user->roleNames();

        $isAdminView = $user->hasPermission('payments.view-all');
        $canViewExpense = $user->hasAnyPermission(['expenses.view', 'expenses.view-all']);

        // Selected cycle (default: current open cycle). A historical/closed
        // cycle shows its exact sealed range; the open cycle shows [start -> today].
        $cycleId = $request->integer('cycle_id') ?: null;
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();

        if (!$cycle) {
            return response()->json([
                'success' => false,
                'message' => 'Billing cycle not found.',
            ], 404);
        }

        // Stash so nested resources (e.g. UserResource) serialize the selected
        // cycle instead of always falling back to the current one.
        $request->attributes->set('billing_cycle', $cycle);

        $from = $cycle->start_date;

        // Expense window: for a CLOSED cycle it is the exact sealed range; for
        // the OPEN cycle it ends TODAY (matching the Expenses list page, so
        // newly added expenses always show up).
        $expenseEnd = $cycle->status === 'closed' ? $cycle->end_date : Carbon::now();
        $trendEnd = $expenseEnd;

        // ===== DATES =====
        // Budget projections still use the cycle's real length.
        $daysInMonth = max(1, $from->diffInDays($cycle->end_date) + 1);
        $daysElapsed = $from->diffInDays($trendEnd) + 1;

        // ===== EXPENSE STATS =====
        $expenseQuery = $user->applyOwnAllScope(
            Expense::query(),
            'expenses.view-all'
        )->inCycle($cycle);

        $expenseCount = $canViewExpense ? (clone $expenseQuery)->count() : 0;
        $expenseTotal = $canViewExpense ? (float) (clone $expenseQuery)->sum('amount') : 0;
        $expenses = $canViewExpense ? ['count' => $expenseCount, 'total' => $expenseTotal] : null;

        // ===== EXPENSE TREND + CATEGORY BREAKDOWN =====
        $expenseTrend = [];
        $categoryBreakdown = [];
        if ($canViewExpense) {
            $dailyTotals = (clone $expenseQuery)
                ->selectRaw('date, SUM(amount) as total')
                ->groupBy('date')
                ->pluck('total', 'date');

            foreach (CarbonPeriod::create($from, $trendEnd) as $day) {
                $key = $day->format('Y-m-d');
                $expenseTrend[] = [
                    'date' => $day->format('d M'),
                    'amount' => (float) ($dailyTotals[$key] ?? 0),
                ];
            }

            $categoryBreakdown = (clone $expenseQuery)
                ->with('category')
                ->get()
                ->groupBy(fn($e) => $e->category->name ?? 'Uncategorized')
                ->map(fn($group, $name) => ['name' => $name, 'amount' => (float) $group->sum('amount')])
                ->sortByDesc('amount')
                ->take(6)
                ->values();
        }

        $recentExpenses = $canViewExpense
            ? (clone $expenseQuery)->with(['user', 'category'])->latest('date')->limit(5)->get()
            : collect();

        // ===== "MY PAYMENTS" — strictly scoped to the CURRENT cycle =====
        $paymentData = null;
        $myAmount = $user->currentCycleAmount($cycle->id);
        if (($user->hasAnyPermission(['payments.view', 'payments.view-all'])) && $myAmount > 0) {
            $myPaid = $user->currentCyclePaid($cycle->id);
            $paymentData = [
                'total_amount' => $myAmount,
                'total_paid' => $myPaid,
                'remaining' => max(0, $myAmount - $myPaid),
                'payment_status' => $user->currentCycleStatus($cycle->id),
                'payment_count' => $user->payments()->where('billing_cycle_id', $cycle->id)->count(),
            ];
        }

        // ===== ADMIN-ONLY SECTIONS — all cycle-scoped =====
        $memberStats = null;
        $allPaymentsSummary = null;
        $budgetHealth = null;

        if ($isAdminView) {
            $allMembers = User::whereHas('roles', fn($q) => $q->where('name', 'member'))
                ->with([
                    'dues' => fn($q) => $q->where('billing_cycle_id', $cycle->id),
                    'payments' => fn($q) => $q->where('billing_cycle_id', $cycle->id),
                ])
                ->get();

            $totalMembers = $allMembers->count();
            $paidMembers = 0;
            $partialMembers = 0;
            $unpaidMembers = 0;
            $assignedMembers = 0;
            $unassignedMembers = 0;
            $totalPaidAll = 0;
            $totalRemainingAll = 0;

            foreach ($allMembers as $member) {
                $amount = $member->currentCycleAmount($cycle->id);
                $paid = $member->currentCyclePaid($cycle->id);
                $remaining = max(0, $amount - $paid);

                $amount > 0 ? $assignedMembers++ : $unassignedMembers++;

                match ($member->currentCycleStatus($cycle->id)) {
                    'paid' => $paidMembers++,
                    'partial' => $partialMembers++,
                    default => $unpaidMembers++,
                };

                $totalPaidAll += $paid;
                if ($remaining > 0) {
                    $totalRemainingAll += $remaining;
                }
            }

            $memberStats = [
                'total' => $totalMembers,
                'paid' => $paidMembers,
                'partial' => $partialMembers,
                'unpaid' => $unpaidMembers,
                'assigned' => $assignedMembers,
                'unassigned' => $unassignedMembers,
                'status_chart' => [
                    ['name' => 'Paid', 'value' => $paidMembers],
                    ['name' => 'Partial', 'value' => $partialMembers],
                    ['name' => 'Unpaid', 'value' => $unpaidMembers],
                ],
            ];

            $allPaymentsSummary = [
                'total_paid' => (float) $totalPaidAll,
                'total_remaining' => (float) $totalRemainingAll,
            ];

            // ===== BUDGET HEALTH (burn-rate), scoped to current cycle =====
            $dailyExpenseTotals = (clone $expenseQuery)
                ->selectRaw('date, SUM(amount) as total')
                ->groupBy('date')
                ->pluck('total', 'date');

            $dailyPaymentTotals = Payment::where('billing_cycle_id', $cycle->id)
                ->selectRaw('DATE(created_at) as day, SUM(paid_amount) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $cumulativeExpense = 0;
            $cumulativeIncome = 0;
            $budgetTrend = [];
            $dayNumber = 1;

            foreach (CarbonPeriod::create($from, $trendEnd) as $day) {
                $key = $day->format('Y-m-d');
                $dailyExpense = (float) ($dailyExpenseTotals[$key] ?? 0);
                $dailyIncome = (float) ($dailyPaymentTotals[$key] ?? 0);
                $cumulativeExpense += $dailyExpense;
                $cumulativeIncome += $dailyIncome;

                $budgetTrend[] = [
                    'day' => $dayNumber, // Day of the cycle (1, 2, 3, ...)
                    'date' => $day->format('d M'),
                    'expenses' => round($dailyExpense, 2),
                    'income' => round($dailyIncome, 2),
                ];

                $dayNumber++;
            }

            $totalIncomeThisMonth = round($totalPaidAll, 2);
            $totalExpenseThisMonth = round($cumulativeExpense, 2);
            $avgDailyExpense = $daysElapsed > 0 ? $totalExpenseThisMonth / $daysElapsed : 0;
            $projectedExpense = round($avgDailyExpense * $daysInMonth, 2);

            if ($totalIncomeThisMonth > 0) {
                $ratio = $projectedExpense / $totalIncomeThisMonth;
                $status = $ratio >= 1 ? 'danger' : ($ratio >= 0.75 ? 'caution' : 'safe');
            } else {
                $status = $totalExpenseThisMonth > 0 ? 'danger' : 'safe';
            }

            $budgetHealth = [
                'trend' => $budgetTrend,
                'total_income' => $totalIncomeThisMonth,
                'total_expense' => $totalExpenseThisMonth,
                'projected_expense' => $projectedExpense,
                'month_progress_pct' => $daysInMonth > 0 ? round(($daysElapsed / $daysInMonth) * 100) : 0,
                'days_elapsed' => $daysElapsed,
                'days_in_month' => $daysInMonth,
                'status' => $status,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'role_names' => $roleNames,
                'permissions' => $permissions,
                'billing_cycle' => [
                    'id' => $cycle->id,
                    'label' => $cycle->label,
                    'start_date' => $cycle->start_date->format('Y-m-d'),
                    'end_date' => $cycle->end_date->format('Y-m-d'),
                    'status' => $cycle->status,
                ],
                'flags' => [
                    'can_view_expense' => $canViewExpense,
                    'show_admin_section' => $isAdminView,
                ],
                'expenses' => $expenses,
                'payment_data' => $paymentData,
                'member_stats' => $memberStats,
                'all_payments_summary' => $allPaymentsSummary,
                'recent_expenses' => $recentExpenses,
                'charts' => [
                    'expense_trend' => $expenseTrend,
                    'category_breakdown' => $categoryBreakdown,
                ],
                'budget_health' => $budgetHealth,
            ],
        ]);
    }
}
