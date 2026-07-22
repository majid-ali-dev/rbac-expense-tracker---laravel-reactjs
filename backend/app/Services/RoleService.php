<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class RoleService
{
    protected RoleRepositoryInterface $roleRepository;

    public function __construct(RoleRepositoryInterface $roleRepository)
    {
        $this->roleRepository = $roleRepository;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Role::with('permissions')
            ->withCount('users')
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Role
    {
        return Role::with(['permissions', 'users'])->withCount('users')->find($id);
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $role = $this->findById($id);
        if (!$role) {
            return false;
        }
        return $role->update($data);
    }

    public function delete(int $id): bool
    {
        $role = $this->findById($id);
        if (!$role) {
            return false;
        }
        return $role->delete();
    }

    public function getAllRoles(): Collection
    {
        return Role::orderBy('name')->get(['id', 'name']);
    }
}