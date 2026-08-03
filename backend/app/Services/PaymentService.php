<?php

namespace App\Services;

use App\Models\BillingCycle;
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

    public function getMemberPayments(int $perPage = 10): LengthAwarePaginator
    {
        $paginator = $this->paymentRepository->getMemberPayments($perPage);
        $cycle = BillingCycle::current();

        $paginator->getCollection()->load([
            'dues' => fn($q) => $q->where('billing_cycle_id', $cycle->id),
            'payments' => fn($q) => $q->where('billing_cycle_id', $cycle->id),
        ]);

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

        $this->updateUserTotals($user);

        return $payment;
    }

    public function deletePayment(Payment $payment): bool
    {
        $user = $payment->user;
        $cycleId = $payment->billing_cycle_id ?? BillingCycle::current()->id;
        $deleted = $this->paymentRepository->delete($payment);

        if ($deleted) {
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
            $this->updateUserStatus($user, $cycleId);
        }

        return $updated;
    }

    /**
     * ✅ NEW: Update user totals and status
     * Called after payment create/update/delete
     */
    public function updateUserTotals(User $user): void
    {
        $cycle = BillingCycle::current();
        $status = $user->currentCycleStatus($cycle->id);

        $user->update([
            'status' => $status,
        ]);
    }

    /**
     * Keeps the legacy `status` column in sync for the CURRENT cycle
     * (still used by simple listing tables/badges elsewhere in the app).
     */
    private function updateUserStatus(User $user, int $billingCycleId): void
    {
        $user->update([
            'status' => $user->currentCycleStatus($billingCycleId),
        ]);
    }

    public function getPaymentStats($users): array
    {
        $cycle = BillingCycle::current();

        $totalAmount = $users->sum(fn(User $u) => $u->currentCycleAmount($cycle->id));
        $totalPaid = $users->sum(fn(User $u) => $u->currentCyclePaid($cycle->id));
        $totalRemaining = $users->sum(fn(User $u) => $u->currentCycleRemaining($cycle->id));
        $paidCount = $users->filter(fn(User $u) => $u->currentCycleStatus($cycle->id) === 'paid')->count();
        $partialCount = $users->filter(fn(User $u) => $u->currentCycleStatus($cycle->id) === 'partial')->count();
        $unpaidCount = $users->filter(fn(User $u) => $u->currentCycleStatus($cycle->id) === 'unpaid')->count();

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
