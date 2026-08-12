<?php

namespace App\Repositories\Contracts;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    public function getMemberPayments(int $perPage = 10, ?int $cycleId = null): LengthAwarePaginator;
    public function getUserWithPayments(User $user): User;
    public function create(array $data): Payment;
    public function delete(Payment $payment): bool;
    public function update(Payment $payment, array $data): bool;
    public function findPaymentById(int $id): ?Payment;
    public function getPaymentUsers();
}
