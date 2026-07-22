<?php

namespace App\Repositories;

use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function getAllMembers(int $perPage = 10): LengthAwarePaginator
    {
        return User::with(['roles', 'payments'])
            ->where('id', '!=', auth()->id())
            ->whereHas('roles', function ($q) {
                $q->where('name', 'member');
            })
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?User
    {
        return User::with(['roles', 'payments'])->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function updateTotal(User $user, float $amount): bool
    {
        // Check if new total is less than already paid
        if ($amount < $user->total_paid) {
            return false;
        }
        return $user->update(['total_amount' => $amount]);
    }

    public function getRoles()
    {
        return Role::orderBy('name')->get(['id', 'name']);
    }
}
