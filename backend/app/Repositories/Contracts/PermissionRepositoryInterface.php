<?php

namespace App\Repositories\Contracts;

use App\Models\Permission;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PermissionRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Permission;
    public function findByName(string $name): ?Permission;
    public function create(array $data): Permission;
    public function update(Permission $permission, array $data): bool;
    public function delete(Permission $permission): bool;
    public function getAllPermissions(): Collection;
    public function getPermissionsByIds(array $ids): Collection;
}
