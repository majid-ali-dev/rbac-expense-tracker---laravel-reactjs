<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;
    public function findById(int $id): ?Category;
    public function findByName(string $name): ?Category;
    public function create(array $data): Category;
    public function update(Category $category, array $data): bool;
    public function delete(Category $category): bool;
    public function getAllCategories();
}
