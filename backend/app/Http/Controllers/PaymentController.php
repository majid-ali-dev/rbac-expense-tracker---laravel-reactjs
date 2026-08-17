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
        $cycleId = $request->integer('cycle_id') ?: null;
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();

        if (!$cycle) {
            return response()->json([
                'success' => false,
                'message' => 'Billing cycle not found.',
            ], 404);
        }

        // ===== OWN SCOPE: only the user's own payments for this cycle =====
        if (!$user->hasPermission('payments.view-all')) {
            $user->load(['payments' => fn($q) => $q->where('billing_cycle_id', $cycle->id)->latest()]);

            $amount = $user->currentCycleAmount($cycle->id);
            $paid = $user->currentCyclePaid($cycle->id);
            $remaining = $user->currentCycleRemaining($cycle->id);
            $status = $user->currentCycleStatus($cycle->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'cycle' => $this->cyclePayload($cycle),
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
        $users = $this->paymentService->getMemberPayments($perPage, $cycle->id);
        $stats = $this->paymentService->getPaymentStats($users->getCollection(), $cycle->id);

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
                'cycle' => $this->cyclePayload($cycle),
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
     * Add-payment page data. When an explicit cycle is selected (including an
     * old/closed one) the page shows that cycle's balances so payments can be
     * recorded against the selected cycle.
     */
    public function addPayment(int $userId, Request $request): JsonResponse
    {
        $cycleId = $request->integer('cycle_id') ?: null;
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();

        if (!$cycle) {
            return response()->json(['success' => false, 'message' => 'Billing cycle not found.'], 404);
        }

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

    /**
     * Record a payment. Written to the EXPLICITLY selected cycle when
     * cycle_id is provided (old/closed cycles included); otherwise to the
     * current open cycle.
     */
    public function pay(PaymentStoreRequest $request, int $userId): JsonResponse
    {
        $targetUser = User::find($userId);

        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        try {
            $cycleId = $request->integer('cycle_id') ?: null;
            $cycle = $cycleId ? BillingCycle::find($cycleId) : null;

            if (!$cycle) {
                $cycle = BillingCycle::where('status', 'open')->latest('start_date')->first();
            }

            if (!$cycle) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active billing cycle. Please create or reopen a cycle first.',
                ], 409);
            }

            $payment = Payment::create([
                'user_id' => $targetUser->id,
                'billing_cycle_id' => $cycle->id,
                'paid_amount' => $request->paid_amount,
                'month' => strtolower(now()->format('M')),
                'updated_by' => auth()->id(),
            ]);

            $this->paymentService->syncMemberDue($targetUser, $cycle->id);
            $this->paymentService->updateUserTotals($targetUser, $cycle->id);

            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully',
                'data' => new PaymentResource($payment->load(['user', 'updater'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Request $request, int $paymentId): JsonResponse
    {
        $payment = $this->paymentService->findPaymentById($paymentId);

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        // Payments in a closed cycle may be deleted only when the cycle is
        // explicitly selected; otherwise closed cycles are immutable.
        if (!$request->integer('cycle_id')) {
            BillingCycle::assertCycleWritable($payment->billing_cycle_id);
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

    private function cyclePayload(BillingCycle $cycle): array
    {
        return [
            'id' => $cycle->id,
            'label' => $cycle->label,
            'start_date' => $cycle->start_date->format('Y-m-d'),
            'end_date' => $cycle->end_date->format('Y-m-d'),
            'status' => $cycle->status,
        ];
    }
}
