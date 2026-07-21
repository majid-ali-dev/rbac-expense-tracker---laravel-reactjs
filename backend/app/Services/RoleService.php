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

    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->roleRepository->getAllPaginated($perPage);
    }

    public function findById(int $id): ?Role
    {
        return $this->roleRepository->findById($id);
    }

    public function create(array $data): Role
    {
        return $this->roleRepository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $role = $this->findById($id);
        if (!$role) {
            return false;
        }
        return $this->roleRepository->update($role, $data);
    }

    public function delete(int $id): bool
    {
        $role = $this->findById($id);
        if (!$role) {
            return false;
        }
        return $this->roleRepository->delete($role);
    }

    public function getAllRoles(): Collection
    {
        return $this->roleRepository->getAllRoles();
    }
}
