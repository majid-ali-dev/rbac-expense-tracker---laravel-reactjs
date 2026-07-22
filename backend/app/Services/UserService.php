<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

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
}