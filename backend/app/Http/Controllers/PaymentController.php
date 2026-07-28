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
        $user = \App\Models\User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($user->total_amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This user has no total amount assigned. Please set total amount first.',
            ], 400);
        }

        $user = $this->paymentService->getUserWithPayments($user);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function pay(PaymentStoreRequest $request, int $userId): JsonResponse
    {
        $user = \App\Models\User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        try {
            $payment = $this->paymentService->createPayment($user, $request->paid_amount);

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
