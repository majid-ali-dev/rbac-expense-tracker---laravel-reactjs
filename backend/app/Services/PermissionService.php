<?php

namespace App\Services;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PermissionService
{
    protected PermissionRepositoryInterface $permissionRepository;

    public function __construct(PermissionRepositoryInterface $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
    }

    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->permissionRepository->getAllPaginated($perPage);
    }

    public function findById(int $id): ?Permission
    {
        return $this->permissionRepository->findById($id);
    }

    public function create(array $data): Permission
    {
        return $this->permissionRepository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $permission = $this->findById($id);
        if (!$permission) {
            return false;
        }
        return $this->permissionRepository->update($permission, $data);
    }

    public function delete(int $id): bool
    {
        $permission = $this->findById($id);
        if (!$permission) {
            return false;
        }
        return $this->permissionRepository->delete($permission);
    }

    public function getAllPermissions(): Collection
    {
        return $this->permissionRepository->getAllPermissions();
    }
}
