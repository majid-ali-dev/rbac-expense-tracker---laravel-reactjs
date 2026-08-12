<?php

namespace App\Repositories;

use App\Models\BillingCycle;
use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10, ?BillingCycle $cycle = null): LengthAwarePaginator
    {
        return Category::query()
            ->withCount(['expenses as expense_count' => fn($q) => $cycle ? $q->inCycle($cycle) : $q])
            ->withSum(['expenses as total_expense' => fn($q) => $cycle ? $q->inCycle($cycle) : $q], 'amount')
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function findByName(string $name): ?Category
    {
        return Category::where('name', $name)->first();
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): bool
    {
        return $category->update($data);
    }

    public function delete(Category $category): bool
    {
        return $category->delete();
    }

    public function getAllCategories()
    {
        return Category::orderBy('name')->get(['id', 'name']);
    }
}
