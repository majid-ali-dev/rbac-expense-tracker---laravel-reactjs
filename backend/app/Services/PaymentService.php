<?php

namespace App\Services;

use App\Models\BillingCycle;
use App\Models\MemberDue;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class PaymentService
{
    protected PaymentRepositoryInterface $paymentRepository;

    public function __construct(PaymentRepositoryInterface $paymentRepository)
    {
        $this->paymentRepository = $paymentRepository;
    }

    public function getMemberPayments(int $perPage = 10, ?int $cycleId = null): LengthAwarePaginator
    {
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();
        $resolvedCycleId = $cycle?->id;

        $paginator = $this->paymentRepository->getMemberPayments($perPage, $resolvedCycleId);

        if ($resolvedCycleId) {
            $paginator->getCollection()->load([
                'dues' => fn($q) => $q->where('billing_cycle_id', $resolvedCycleId),
                'payments' => fn($q) => $q
                    ->where('billing_cycle_id', $resolvedCycleId)
                    // billing_cycle_id MUST be selected — User::currentCyclePaid()
                    // filters the loaded collection by it, and without the column
                    // every payment looks like it belongs to no cycle (paid=0).
                    ->select('id', 'user_id', 'billing_cycle_id', 'paid_amount', 'month', 'updated_by', 'created_at')
                    ->latest(),
            ]);
        }

        return $paginator;
    }

    public function getUserWithPayments(User $user): User
    {
        return $this->paymentRepository->getUserWithPayments($user);
    }

    public function createPayment(User $user, float $amount): Payment
    {
        $cycle = BillingCycle::current();
        $remaining = $user->currentCycleRemaining($cycle->id);

        if ($amount > $remaining) {
            throw new \Exception("Payment amount cannot exceed remaining balance of Rs " . number_format($remaining, 2));
        }

        $payment = $this->paymentRepository->create([
            'user_id' => $user->id,
            'billing_cycle_id' => $cycle->id,
            'paid_amount' => $amount,
            'month' => strtolower(now()->format('M')),
            'updated_by' => Auth::id(),
        ]);

        $this->syncMemberDue($user, $cycle->id);
        $this->updateUserTotals($user, $cycle->id);

        return $payment;
    }

    public function deletePayment(Payment $payment): bool
    {
        $user = $payment->user;
        $cycleId = $payment->billing_cycle_id ?? BillingCycle::current()->id;
        $deleted = $this->paymentRepository->delete($payment);

        if ($deleted) {
            $this->syncMemberDue($user, $cycleId);
            $this->updateUserStatus($user, $cycleId);
        }

        return $deleted;
    }

    public function updatePayment(Payment $payment, float $amount): bool
    {
        $user = $payment->user;
        $cycleId = $payment->billing_cycle_id ?? BillingCycle::current()->id;

        $allowedLimit = $user->currentCycleRemaining($cycleId) + (float) $payment->paid_amount;

        if ($amount > $allowedLimit) {
            throw new \Exception("Updated amount cannot exceed the remaining balance for this user.");
        }

        $updated = $this->paymentRepository->update($payment, [
            'paid_amount' => $amount,
            'updated_by' => Auth::id(),
        ]);

        if ($updated) {
            $this->syncMemberDue($user, $cycleId);
            $this->updateUserStatus($user, $cycleId);
        }

        return $updated;
    }

    /**
     * Keep the legacy `status` column in sync with a member's CURRENT cycle
     * state (the status column is an operational value for the open cycle).
     */
    public function updateUserTotals(User $user, int $cycleId): void
    {
        $this->updateUserStatus($user, $cycleId);
    }

    private function updateUserStatus(User $user, int $billingCycleId): void
    {
        // Only refresh the user's live status when the payment belongs to the
        // current open cycle — historical cycles must not clobber live state.
        $current = BillingCycle::where('status', 'open')->latest('start_date')->first();

        if ($current && (int) $current->id === (int) $billingCycleId) {
            $user->update([
                'status' => $user->currentCycleStatus($billingCycleId),
            ]);
        }
    }

    /**
     * Recompute and persist a member's amount_paid for a cycle in member_dues.
     * Keeps the per-cycle snapshot accurate even when a payment is added or
     * removed after the cycle has been closed.
     */
    public function syncMemberDue(User $user, int $billingCycleId): void
    {
        $paidAmount = (float) Payment::where('user_id', $user->id)
            ->where('billing_cycle_id', $billingCycleId)
            ->sum('paid_amount');

        $assigned = (float) (MemberDue::where('user_id', $user->id)
            ->where('billing_cycle_id', $billingCycleId)
            ->value('amount_assigned') ?? $user->total_amount ?? 0);

        MemberDue::updateOrCreate(
            ['user_id' => $user->id, 'billing_cycle_id' => $billingCycleId],
            ['amount_assigned' => $assigned, 'amount_paid' => $paidAmount]
        );
    }

    public function getPaymentStats($users, ?int $cycleId = null): array
    {
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();
        $resolvedCycleId = $cycle?->id;

        $totalAmount = $users->sum(fn(User $u) => $u->currentCycleAmount($resolvedCycleId));
        $totalPaid = $users->sum(fn(User $u) => $u->currentCyclePaid($resolvedCycleId));
        $totalRemaining = $users->sum(fn(User $u) => $u->currentCycleRemaining($resolvedCycleId));
        $paidCount = $users->filter(fn(User $u) => $u->currentCycleStatus($resolvedCycleId) === 'paid')->count();
        $partialCount = $users->filter(fn(User $u) => $u->currentCycleStatus($resolvedCycleId) === 'partial')->count();
        $unpaidCount = $users->filter(fn(User $u) => $u->currentCycleStatus($resolvedCycleId) === 'unpaid')->count();

        return [
            'total_amount' => $totalAmount,
            'total_paid' => $totalPaid,
            'total_remaining' => $totalRemaining,
            'paid_count' => $paidCount,
            'partial_count' => $partialCount,
            'unpaid_count' => $unpaidCount,
        ];
    }

    public function getPaymentUsers()
    {
        return $this->paymentRepository->getPaymentUsers();
    }

    public function findPaymentById(int $id): ?Payment
    {
        return $this->paymentRepository->findPaymentById($id);
    }
}
