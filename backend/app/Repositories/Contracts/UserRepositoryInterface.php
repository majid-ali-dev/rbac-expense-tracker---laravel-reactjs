<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function create(array $data): User;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function getMembers(array $filters = []): LengthAwarePaginator;
    public function updateTotalAmount(int $userId, float $amount): bool;
}
