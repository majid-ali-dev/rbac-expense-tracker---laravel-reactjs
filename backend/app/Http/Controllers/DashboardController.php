<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $permissions = $user->permissions();
        $roleNames = $user->roleNames();

        $expenseQuery = Expense::query();

        if (!$user->hasRole('manager') && !$user->hasRole('super_admin')) {
            $expenseQuery->where('user_id', $user->id);
        }

        $expenseCount = $user->hasPermission('view-expense')
            ? (clone $expenseQuery)->count()
            : 0;

        $totalAmount = $user->hasPermission('view-expense')
            ? (clone $expenseQuery)->sum('amount')
            : 0;

        // Payment data for members
        $paymentData = [];
        if ($user->hasRole('member')) {
            $paymentData = [
                'total_amount' => (float) $user->total_amount ?? 0,
                'total_paid' => (float) $user->total_paid ?? 0,
                'remaining' => (float) $user->remaining ?? 0,
                'payment_status' => $user->payment_status ?? 'unpaid',
                'payment_count' => $user->payments()->count(),
                'last_payment' => $user->payments()->latest()->first(),
            ];
        }

        // Recent expenses
        $recentExpenses = $user->hasPermission('view-expense')
            ? $expenseQuery->with(['user', 'category'])
            ->latest('date')
            ->limit(5)
            ->get()
            : collect();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'role_names' => $roleNames,
                'permissions' => $permissions,
                'stats' => [
                    'can_manage_users' => $user->hasPermission('manage-users'),
                    'can_manage_roles' => $user->hasPermission('assign-roles'),
                    'can_view_expenses' => $user->hasPermission('view-expense'),
                    'can_create_expenses' => $user->hasPermission('create-expense'),
                    'can_download_expenses' => $user->hasPermission('download-expense'),
                    'expense_count' => $expenseCount,
                    'total_amount' => (float) $totalAmount,
                ],
                'payment_data' => $paymentData,
                'recent_expenses' => $recentExpenses,
            ],
        ]);
    }
}
