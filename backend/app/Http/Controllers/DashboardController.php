<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $permissions = $user->permissions();
        $roleNames = $user->roleNames();

        // Current month date range
        $from = Carbon::now()->startOfMonth();
        $to = Carbon::now()->endOfMonth();
        $trendEnd = Carbon::now()->lessThan($to) ? Carbon::now() : $to->copy();

        $canViewExpense = $user->hasPermission('view-expense');

        // ===== EXPENSE STATS =====
        $expenseQuery = Expense::query()->whereBetween('date', [$from->format('Y-m-d'), $to->format('Y-m-d')]);

        if (!$user->hasRole('manager') && !$user->hasRole('super_admin') && !$user->hasPermission('view-all-expenses')) {
            $expenseQuery->where('user_id', $user->id);
        }

        $expenseCount = $canViewExpense ? (clone $expenseQuery)->count() : 0;
        $expenseTotal = $canViewExpense ? (clone $expenseQuery)->sum('amount') : 0;

        // ===== EXPENSE TREND (daily, for area chart) =====
        $expenseTrend = [];
        if ($canViewExpense) {
            $dailyTotals = (clone $expenseQuery)
                ->selectRaw('date, SUM(amount) as total')
                ->groupBy('date')
                ->pluck('total', 'date');

            $period = CarbonPeriod::create($from, $trendEnd);
            foreach ($period as $day) {
                $key = $day->format('Y-m-d');
                $expenseTrend[] = [
                    'date' => $day->format('d M'),
                    'amount' => (float) ($dailyTotals[$key] ?? 0),
                ];
            }
        }

        // ===== CATEGORY BREAKDOWN (bar chart) =====
        $categoryBreakdown = [];
        if ($canViewExpense) {
            $categoryBreakdown = (clone $expenseQuery)
                ->with('category')
                ->get()
                ->groupBy(fn($e) => $e->category->name ?? 'Uncategorized')
                ->map(fn($group, $name) => [
                    'name' => $name,
                    'amount' => (float) $group->sum('amount'),
                ])
                ->sortByDesc('amount')
                ->take(6)
                ->values();
        }

        // ===== RECENT EXPENSES =====
        $recentExpenses = $canViewExpense
            ? (clone $expenseQuery)->with(['user', 'category'])
            ->latest('date')
            ->limit(5)
            ->get()
            : collect();

        // ===== USER PAYMENT DATA =====
        $paymentData = [];
        if ($user->total_amount > 0) {
            $paymentsInRange = $user->payments()
                ->whereBetween('created_at', [$from->format('Y-m-d 00:00:00'), $to->format('Y-m-d 23:59:59')])
                ->get();

            $paymentData = [
                'total_amount' => (float) $user->total_amount,
                'total_paid' => (float) $user->total_paid,
                'total_paid_in_range' => (float) $paymentsInRange->sum('paid_amount'),
                'remaining' => (float) $user->remaining,
                'payment_status' => $user->payment_status,
                'payment_count' => $user->payments()->count(),
            ];
        }

        // ===== MEMBER STATS (Admin Only) =====
        $memberStats = [];
        $allPaymentsSummary = [];

        if ($user->hasRole('manager') || $user->hasRole('super_admin')) {
            $allMembers = User::whereHas('roles', fn($q) => $q->where('name', 'member'))
                ->with('payments')
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
                if ((float) $member->total_amount > 0) {
                    $assignedMembers++;
                } else {
                    $unassignedMembers++;
                }

                match ($member->payment_status) {
                    'paid' => $paidMembers++,
                    'partial' => $partialMembers++,
                    default => $unpaidMembers++,
                };

                $paidInRange = $member->payments
                    ->filter(fn($p) => $p->created_at->between($from->copy()->startOfDay(), $to->copy()->endOfDay()))
                    ->sum('paid_amount');

                $totalPaidAll += $paidInRange;

                $remainingForMember = $member->total_amount - $paidInRange;
                if ($remainingForMember > 0) {
                    $totalRemainingAll += $remainingForMember;
                }
            }

            $memberStats = [
                'total' => $totalMembers,
                'paid' => $paidMembers,
                'partial' => $partialMembers,
                'unpaid' => $unpaidMembers,
                'assigned' => $assignedMembers,
                'unassigned' => $unassignedMembers,
                // Ready-made chart data for the donut chart
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
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'role_names' => $roleNames,
                'permissions' => $permissions,
                'expenses' => [
                    'count' => $expenseCount,
                    'total' => (float) $expenseTotal,
                ],
                'payment_data' => $paymentData,
                'member_stats' => $memberStats,
                'all_payments_summary' => $allPaymentsSummary,
                'recent_expenses' => $recentExpenses,
                'charts' => [
                    'expense_trend' => $expenseTrend,
                    'category_breakdown' => $categoryBreakdown,
                ],
            ],
        ]);
    }
}
