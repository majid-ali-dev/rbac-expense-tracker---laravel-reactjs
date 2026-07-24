<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseRepository implements ExpenseRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return Expense::with(['user', 'category'])
            ->latest('date')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Expense
    {
        return Expense::with(['user', 'category'])->find($id);
    }

    public function create(array $data): Expense
    {
        return Expense::create($data);
    }

    public function update(Expense $expense, array $data): bool
    {
        return $expense->update($data);
    }

    public function delete(Expense $expense): bool
    {
        return $expense->delete();
    }

    public function getExpenseQuery($user)
    {
        $query = Expense::query();

        if (!$user->hasRole('manager') && !$user->hasRole('super_admin') && !$user->hasPermission('view-all-expenses')) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    public function getCategories()
    {
        return Category::orderBy('name')->get(['id', 'name']);
    }
}
