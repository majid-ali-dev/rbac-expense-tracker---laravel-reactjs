<?php

namespace App\Services;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class ExpenseService
{
    protected ExpenseRepositoryInterface $expenseRepository;

    public function __construct(ExpenseRepositoryInterface $expenseRepository)
    {
        $this->expenseRepository = $expenseRepository;
    }

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        $user = Auth::user();
        $query = $this->expenseRepository->getExpenseQuery($user);
        return $query->with(['user', 'category'])
            ->latest('date')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Expense
    {
        return $this->expenseRepository->findById($id);
    }

    public function create(array $data): Expense
    {
        $category = $this->expenseRepository->getCategories()->where('id', $data['category_id'])->first();
        $data['user_id'] = Auth::id();
        $data['title'] = $category ? $category->name : '';
        return $this->expenseRepository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $expense = $this->findById($id);
        if (!$expense) {
            return false;
        }
        $category = $this->expenseRepository->getCategories()->where('id', $data['category_id'])->first();
        $data['title'] = $category ? $category->name : '';
        $data['updated_by'] = Auth::id();
        return $this->expenseRepository->update($expense, $data);
    }

    public function delete(int $id): bool
    {
        $expense = $this->findById($id);
        if (!$expense) {
            return false;
        }
        return $this->expenseRepository->delete($expense);
    }

    public function getCategories()
    {
        return $this->expenseRepository->getCategories();
    }
}