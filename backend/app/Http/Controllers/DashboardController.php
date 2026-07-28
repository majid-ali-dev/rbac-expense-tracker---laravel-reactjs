<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Payment;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $permissions = $user->permissions();
        $roleNames = $user->roleNames();

        // Get current month date range
        $from = Carbon::now()->startOfMonth()->format('Y-m-d');
        $to = Carbon::now()->endOfMonth()->format('Y-m-d');

        // ===== EXPENSE STATS =====
        $expenseQuery = Expense::query()->whereBetween('date', [$from, $to]);

        if (!$user->hasRole('manager') && !$user->hasRole('super_admin') && !$user->hasPermission('view-all-expenses')) {
            $expenseQuery->where('user_id', $user->id);
        }

        $expenseCount = $user->hasPermission('view-expense') ? (clone $expenseQuery)->count() : 0;
        $expenseTotal = $user->hasPermission('view-expense') ? (clone $expenseQuery)->sum('amount') : 0;

        // ===== RECENT EXPENSES =====
        $recentExpenses = $user->hasPermission('view-expense')
            ? (clone $expenseQuery)->with(['user', 'category'])
            ->latest('date')
            ->limit(5)
            ->get()
            : collect();

        // ===== USER PAYMENT DATA =====
        $paymentData = [];
        if ($user->total_amount > 0) {
            $paymentsInRange = $user->payments()
                ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
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
            // Load all members with their payments
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
                // ===== ASSIGNED / UNASSIGNED =====
                if ($member->total_amount > 0) {
                    $assignedMembers++;
                } else {
                    $unassignedMembers++;
                }

                // ===== LIVE STATUS =====
                match ($member->payment_status) {
                    'paid' => $paidMembers++,
                    'partial' => $partialMembers++,
                    default => $unpaidMembers++,
                };

                // ===== PAYMENTS IN CURRENT MONTH =====
                $paidInRange = $member->payments
                    ->filter(function ($payment) use ($from, $to) {
                        return $payment->created_at->between(
                            Carbon::parse($from)->startOfDay(),
                            Carbon::parse($to)->endOfDay()
                        );
                    })
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
            ],
        ]);
    }
}
