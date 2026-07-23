<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CategoryService
{
    protected CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->categoryRepository->getAllPaginated($perPage);
    }

    public function findById(int $id): ?Category
    {
        return $this->categoryRepository->findById($id);
    }

    public function create(array $data): Category
    {
        return $this->categoryRepository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $category = $this->findById($id);
        if (!$category) {
            return false;
        }
        return $this->categoryRepository->update($category, $data);
    }

    public function delete(int $id): bool
    {
        $category = $this->findById($id);
        if (!$category) {
            return false;
        }
        return $this->categoryRepository->delete($category);
    }

    public function getAllCategories(): Collection
    {
        return $this->categoryRepository->getAllCategories();
    }
}
