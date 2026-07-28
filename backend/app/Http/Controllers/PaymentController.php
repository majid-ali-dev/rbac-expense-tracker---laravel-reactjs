<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payment\PaymentStoreRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\UserResource;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Check permission
        if (!$user->hasPermission('view-payment')) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied',
            ], 403);
        }

        // If user is member, show only their own payments
        if ($user->hasRole('member')) {
            // Load payments for the member
            $user->load(['payments' => function ($query) {
                $query->latest();
            }]);

            // Calculate stats using the accessors
            $totalPaid = $user->total_paid;
            $remaining = $user->remaining;
            $status = $user->payment_status;

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [new UserResource($user)],
                    'stats' => [
                        'total_amount' => (float) $user->total_amount,
                        'total_paid' => (float) $totalPaid,
                        'total_remaining' => (float) $remaining,
                        'paid_count' => $status === 'paid' ? 1 : 0,
                        'partial_count' => $status === 'partial' ? 1 : 0,
                        'unpaid_count' => $status === 'unpaid' ? 1 : 0,
                    ],
                ],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 1,
                    'last_page' => 1,
                ],
            ]);
        }

        // For Manager and Super Admin - show all members
        $perPage = $request->get('per_page', 10);
        $users = $this->paymentService->getMemberPayments($perPage);
        $stats = $this->paymentService->getPaymentStats($users);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => UserResource::collection($users),
                'stats' => $stats,
            ],
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function addPayment(int $userId): JsonResponse
    {
        $user = auth()->user();

        // Only managers and super admin can add payments for others
        if (!$user->hasRole('manager') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied. Only managers can add payments.',
            ], 403);
        }

        $targetUser = \App\Models\User::with(['payments' => function ($query) {
            $query->latest();
        }])->find($userId);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($targetUser->total_amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This user has no total amount assigned. Please set total amount first.',
            ], 400);
        }

        // Use accessors
        $targetUser->total_paid = $targetUser->total_paid;
        $targetUser->remaining = $targetUser->remaining;

        return response()->json([
            'success' => true,
            'data' => new UserResource($targetUser),
        ]);
    }

    public function pay(PaymentStoreRequest $request, int $userId): JsonResponse
    {
        $user = auth()->user();

        // Only managers and super admin can add payments
        if (!$user->hasRole('manager') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied. Only managers can add payments.',
            ], 403);
        }

        $targetUser = \App\Models\User::find($userId);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        try {
            $payment = $this->paymentService->createPayment($targetUser, $request->paid_amount);

            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully',
                'data' => new PaymentResource($payment->load(['user', 'updater'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(int $paymentId): JsonResponse
    {
        $user = auth()->user();

        // Only managers and super admin can delete payments
        if (!$user->hasRole('manager') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied. Only managers can delete payments.',
            ], 403);
        }

        $payment = $this->paymentService->findPaymentById($paymentId);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found',
            ], 404);
        }

        $deleted = $this->paymentService->deletePayment($payment);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully',
        ]);
    }
}
