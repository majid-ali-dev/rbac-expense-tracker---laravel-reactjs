<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::with(['roles.permissions', 'payments'])->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }
        return $user->update($data);
    }

    public function delete(int $id): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }
        return $user->delete();
    }

    public function getMembers(array $filters = []): LengthAwarePaginator
    {
        $query = User::whereHas('roles', function ($q) {
            $q->where('name', 'member');
        });

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->with(['roles.permissions', 'payments'])
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function updateTotalAmount(int $userId, float $amount): bool
    {
        $user = $this->findById($userId);
        if (!$user) {
            return false;
        }

        // Check if new total is less than already paid
        if ($amount < $user->total_paid) {
            return false;
        }

        return $user->update(['total_amount' => $amount]);
    }
}
