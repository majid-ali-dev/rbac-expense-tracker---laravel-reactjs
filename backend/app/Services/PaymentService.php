<?php

namespace App\Services;

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
        return $this->paymentRepository->getMemberPayments($perPage);
    }

    public function getUserWithPayments(User $user): User
    {
        return $this->paymentRepository->getUserWithPayments($user);
    }

    public function createPayment(User $user, float $amount): Payment
    {
        // Check if amount exceeds remaining balance
        $remaining = $user->remaining;
        if ($amount > $remaining) {
            throw new \Exception("Payment amount cannot exceed remaining balance of Rs " . number_format($remaining, 2));
        }

        $payment = $this->paymentRepository->create([
            'user_id' => $user->id,
            'paid_amount' => $amount,
            'month' => strtolower(now()->format('M')),
            'updated_by' => Auth::id(),
        ]);

        // Update user totals
        $this->updateUserTotals($user);

        return $payment;
    }

    public function deletePayment(Payment $payment): bool
    {
        $user = $payment->user;
        $deleted = $this->paymentRepository->delete($payment);

        if ($deleted) {
            $this->updateUserTotals($user);
        }

        return $deleted;
    }

    public function updatePayment(Payment $payment, float $amount): bool
    {
        $user = $payment->user;
        $allowedLimit = $user->remaining + $payment->paid_amount;

        if ($amount > $allowedLimit) {
            throw new \Exception("Updated amount cannot exceed the remaining balance for this user.");
        }

        $updated = $this->paymentRepository->update($payment, [
            'paid_amount' => $amount,
            'updated_by' => Auth::id(),
        ]);

        if ($updated) {
            $this->updateUserTotals($user);
        }

        return $updated;
    }

    private function updateUserTotals(User $user): void
    {
        $totalPaid = $user->payments()->sum('paid_amount');
        $remaining = $user->total_amount - $totalPaid;

        $status = 'unpaid';
        if ($remaining <= 0) {
            $status = 'paid';
        } elseif ($totalPaid > 0 && $remaining > 0) {
            $status = 'partial';
        }

        $user->update([
            'total_paid' => $totalPaid,
            'remaining' => $remaining,
            'payment_status' => $status,
        ]);
    }

    public function getPaymentStats($users): array
    {
        $totalAmount = $users->sum(fn(User $user) => (float) $user->total_amount);
        $totalPaid = $users->sum(fn(User $user) => (float) $user->total_paid);
        $totalRemaining = $users->sum(fn(User $user) => (float) $user->remaining);
        $paidCount = $users->where('payment_status', 'paid')->count();
        $partialCount = $users->where('payment_status', 'partial')->count();
        $unpaidCount = $users->where('payment_status', 'unpaid')->count();

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
}
