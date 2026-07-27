<?php

namespace App\Repositories\Contracts;

use App\Models\Expense;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExpenseRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;
    public function findById(int $id): ?Expense;
    public function create(array $data): Expense;
    public function update(Expense $expense, array $data): bool;
    public function delete(Expense $expense): bool;
    public function getCategories();
    public function getExpenseQuery($user);
}
