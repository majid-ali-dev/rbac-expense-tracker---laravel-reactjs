<?php

namespace App\Repositories\Contracts;

use App\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;

interface RoleRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Role;
    public function findByName(string $name): ?Role;
    public function create(array $data): Role;
    public function update(Role $role, array $data): bool;
    public function delete(Role $role): bool;
    public function getAllRoles();
}
