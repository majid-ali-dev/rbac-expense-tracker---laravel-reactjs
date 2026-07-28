<?php

namespace App\Repositories;

use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function getMemberPayments(int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
            ->whereHas('roles', fn($query) => $query->where('name', 'member'))
            ->where('total_amount', '>', 0)
            ->with([
                'payments' => fn($query) => $query
                    ->select('id', 'user_id', 'paid_amount', 'month', 'updated_by', 'created_at')
                    ->latest(),
            ])
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function getUserWithPayments(User $user): User
    {
        return $user->load([
            'payments' => fn($query) => $query
                ->select('id', 'user_id', 'paid_amount', 'month', 'updated_by', 'created_at')
                ->latest(),
        ]);
    }

    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function delete(Payment $payment): bool
    {
        return $payment->delete();
    }

    public function update(Payment $payment, array $data): bool
    {
        return $payment->update($data);
    }

    public function findPaymentById(int $id): ?Payment
    {
        return Payment::with(['user', 'updater'])->find($id);
    }

    public function getPaymentUsers()
    {
        return User::query()
            ->whereHas('roles', fn($query) => $query->where('name', 'member'))
            ->where('total_amount', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'total_amount', 'total_paid', 'remaining', 'payment_status']);
    }
}
