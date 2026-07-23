<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

class UserService
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllMembers(int $perPage = 10): LengthAwarePaginator
    {
        return $this->userRepository->getAllMembers($perPage);
    }

    public function findById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        return $this->userRepository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }
        return $this->userRepository->update($user, $data);
    }

    public function delete(int $id): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }
        return $this->userRepository->delete($user);
    }

    public function updateTotal(int $id, float $amount): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }
        return $this->userRepository->updateTotal($user, $amount);
    }

    public function getRoles()
    {
        return $this->userRepository->getRoles();
    }

    /**
     * Get user with complete payment history
     */
    public function getUserWithPaymentHistory(int $id): ?array
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            return null;
        }

        // Load payments with updater
        $user->load(['payments.updater']);

        // Calculate totals
        $totalPaid = $user->payments->sum('paid_amount');
        $remaining = max(0, (float) $user->total_amount - (float) $totalPaid);

        // Group payments by month
        $paymentHistory = $this->groupPaymentsByMonth($user->payments);

        return [
            'user' => $user,
            'total_paid' => (float) $totalPaid,
            'remaining' => (float) $remaining,
            'payment_history' => $paymentHistory,
        ];
    }

    /**
     * Group payments by month
     */
    private function groupPaymentsByMonth(Collection $payments): Collection
    {
        return $payments->groupBy(function ($payment) {
            return $payment->created_at->format('F Y');
        })->map(function ($monthlyPayments, $month) {
            return [
                'month' => $month,
                'payments' => $monthlyPayments->map(function ($payment) {
                    return [
                        'date' => $payment->created_at->format('d M Y'),
                        'amount' => (float) $payment->paid_amount,
                        'month_label' => ucfirst($payment->month),
                        'updated_by' => $payment->updater?->name ?? 'System',
                    ];
                }),
                'total' => (float) $monthlyPayments->sum('paid_amount'),
            ];
        })->values();
    }
}