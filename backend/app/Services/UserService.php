<?php

namespace App\Services;

use App\Models\BillingCycle;
use App\Models\MemberDue;
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

    /**
     * FIXED: Ab agar "Edit User" form se bhi total_amount aata hai,
     * to current cycle ka MemberDue row bhi sync ho jata hai — warna
     * currentCycleAmount() hamesha purani (0 wali) MemberDue value hi
     * padhta rehta, chahe users.total_amount column update ho jaye.
     */
    public function update(int $id, array $data): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }

        $updated = $this->userRepository->update($user, $data);

        if ($updated && array_key_exists('total_amount', $data) && $data['total_amount'] !== null) {
            $cycle = BillingCycle::current();

            MemberDue::updateOrCreate(
                ['user_id' => $user->id, 'billing_cycle_id' => $cycle->id],
                ['amount_assigned' => $data['total_amount']]
            );
        }

        return $updated;
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

        $cycle = BillingCycle::current();

        MemberDue::updateOrCreate(
            ['user_id' => $user->id, 'billing_cycle_id' => $cycle->id],
            ['amount_assigned' => $amount]
        );

        return $this->userRepository->update($user, ['total_amount' => $amount]);
    }

    public function getRoles()
    {
        return $this->userRepository->getRoles();
    }

    public function getUserWithPaymentHistory(int $id): ?array
    {
        $user = $this->userRepository->findById($id);

        if (!$user) {
            return null;
        }

        $user->load(['roles', 'payments.updater', 'payments.billingCycle', 'dues.billingCycle']);

        $cycle = BillingCycle::current();
        $amount = $user->currentCycleAmount($cycle->id);
        $paid = $user->currentCyclePaid($cycle->id);
        $remaining = $user->currentCycleRemaining($cycle->id);
        $status = $user->currentCycleStatus($cycle->id);

        $paymentHistory = $this->groupPaymentsByMonth($user->payments);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'total_amount' => $amount,
                'total_paid' => $paid,
                'remaining' => $remaining,
                'payment_status' => $status,
                'roles' => $user->roles->pluck('name'),
                'joined_at' => $user->created_at?->format('d M Y'),
            ],
            'total_paid' => $paid,
            'remaining' => $remaining,
            'payment_history' => $paymentHistory,
        ];
    }

    private function groupPaymentsByMonth(Collection $payments): Collection
    {
        return $payments->groupBy(function ($payment) {
            return $payment->billingCycle->label ?? $payment->created_at->format('F Y');
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

    public function resetAllMemberAmounts(): void
    {
        $members = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->get();

        foreach ($members as $member) {
            $member->update(['total_amount' => 0]);
        }
    }
}
