<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payment\PaymentStoreRequest;
use App\Http\Resources\PaymentResource;
use App\Models\BillingCycle;
use App\Models\Payment;
use App\Models\User;
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
        $cycle = BillingCycle::current();

        // ===== OWN SCOPE: only the user's own payments =====
        if (!$user->hasPermission('payments.view-all')) {
            $user->load(['payments' => fn($q) => $q->where('billing_cycle_id', $cycle->id)->latest()]);

            $amount = $user->currentCycleAmount($cycle->id);
            $paid = $user->currentCyclePaid($cycle->id);
            $remaining = $user->currentCycleRemaining($cycle->id);
            $status = $user->currentCycleStatus($cycle->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [$this->formatUserRow($user, $amount, $paid, $remaining, $status)],
                    'stats' => [
                        'total_amount' => $amount,
                        'total_paid' => $paid,
                        'total_remaining' => $remaining,
                        'paid_count' => $status === 'paid' ? 1 : 0,
                        'partial_count' => $status === 'partial' ? 1 : 0,
                        'unpaid_count' => $status === 'unpaid' ? 1 : 0,
                    ],
                ],
                'meta' => ['current_page' => 1, 'per_page' => 10, 'total' => 1, 'last_page' => 1],
            ]);
        }

        // ===== MANAGER / SUPER ADMIN: all members, all cycle-scoped =====
        $perPage = $request->get('per_page', 10);
        $users = $this->paymentService->getMemberPayments($perPage);
        $stats = $this->paymentService->getPaymentStats($users->getCollection());

        $rows = $users->getCollection()->map(function (User $u) use ($cycle) {
            $amount = $u->currentCycleAmount($cycle->id);
            $paid = $u->currentCyclePaid($cycle->id);
            $remaining = $u->currentCycleRemaining($cycle->id);
            $status = $u->currentCycleStatus($cycle->id);

            return $this->formatUserRow($u, $amount, $paid, $remaining, $status);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $rows,
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

    /**
     * Now allows adding payment even if amount = 0
     */
    public function addPayment(int $userId): JsonResponse
    {
        $cycle = BillingCycle::current();

        $targetUser = User::with(['payments' => fn($q) => $q->where('billing_cycle_id', $cycle->id)->latest()])
            ->find($userId);

        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Get cycle data - even if amount is 0
        $amount = $targetUser->currentCycleAmount($cycle->id);
        $paid = $targetUser->currentCyclePaid($cycle->id);
        $remaining = $targetUser->currentCycleRemaining($cycle->id);
        $status = $targetUser->currentCycleStatus($cycle->id);


        return response()->json([
            'success' => true,
            'data' => [
                ...$this->formatUserRow($targetUser, $amount, $paid, $remaining, $status),
                'payments' => PaymentResource::collection($targetUser->payments),
            ],
        ]);
    }

    public function pay(PaymentStoreRequest $request, int $userId): JsonResponse
    {
        $targetUser = User::find($userId);

        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        try {
            $currentCycle = BillingCycle::current();

            $payment = Payment::create([
                'user_id' => $targetUser->id,
                'billing_cycle_id' => $currentCycle->id,
                'paid_amount' => $request->paid_amount,
                'month' => strtolower(now()->format('M')),
                'updated_by' => auth()->id(),
            ]);

            $this->paymentService->updateUserTotals($targetUser);

            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully',
                'data' => new PaymentResource($payment->load(['user', 'updater'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function destroy(int $paymentId): JsonResponse
    {
        $payment = $this->paymentService->findPaymentById($paymentId);

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        $deleted = $this->paymentService->deletePayment($payment);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Failed to delete payment'], 500);
        }

        return response()->json(['success' => true, 'message' => 'Payment deleted successfully']);
    }

    /**
     * Single source of truth for how a member row looks everywhere in the
     * Payments module — table rows AND stats now always agree because they
     * both come from the same cycle-scoped User methods.
     */
    private function formatUserRow(User $user, float $amount, float $paid, float $remaining, string $status): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'total_amount' => $amount,
            'total_paid' => $paid,
            'remaining' => $remaining,
            'payment_status' => $status,
        ];
    }
}
