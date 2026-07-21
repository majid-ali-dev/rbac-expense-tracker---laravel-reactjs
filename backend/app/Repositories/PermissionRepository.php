<?php

namespace App\Repositories;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PermissionRepository implements PermissionRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return Permission::withCount('roles')
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Permission
    {
        return Permission::with(['roles'])->find($id);
    }

    public function findByName(string $name): ?Permission
    {
        return Permission::where('name', $name)->first();
    }

    public function create(array $data): Permission
    {
        return Permission::create($data);
    }

    public function update(Permission $permission, array $data): bool
    {
        return $permission->update($data);
    }

    public function delete(Permission $permission): bool
    {
        return $permission->delete();
    }

    public function getAllPermissions(): Collection
    {
        return Permission::orderBy('name')->get(['id', 'name']);
    }

    public function getPermissionsByIds(array $ids): Collection
    {
        return Permission::whereIn('id', $ids)->get();
    }
}
