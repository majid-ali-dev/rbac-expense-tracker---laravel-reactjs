<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\ExpenseHistory;
use App\Models\BillingCycle;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ExpenseService
{
    protected ExpenseRepositoryInterface $expenseRepository;

    public function __construct(ExpenseRepositoryInterface $expenseRepository)
    {
        $this->expenseRepository = $expenseRepository;
    }

    /**
     * FIXED: Only show expenses from CURRENT cycle
     * Uses cycle start date and TODAY as end date
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        $user = Auth::user();
        $cycle = BillingCycle::current();

        // Start from cycle start, end at today
        $startDate = $cycle->start_date->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $query = $this->expenseRepository->getExpenseQuery($user);
        $query->whereBetween('date', [
            $startDate->format('Y-m-d'),
            $endDate->format('Y-m-d')
        ]);

        return $query->with(['user', 'category', 'histories.user'])
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

        // Ensure date is set (use today if not provided)
        if (!isset($data['date']) || empty($data['date'])) {
            $data['date'] = Carbon::now()->format('Y-m-d');
        }

        $expense = $this->expenseRepository->create($data);

        ExpenseHistory::create([
            'expense_id' => $expense->id,
            'user_id' => Auth::id(),
            'action' => 'created',
            'old_data' => null,
            'new_data' => $this->getHistoryPayload($expense),
            'changed_fields' => 'title,amount,date,description',
        ]);

        return $expense;
    }

    public function update(int $id, array $data): bool
    {
        $expense = $this->findById($id);
        if (!$expense) {
            return false;
        }

        $oldData = $this->getHistoryPayload($expense);

        $category = $this->expenseRepository->getCategories()->where('id', $data['category_id'])->first();
        $data['title'] = $category ? $category->name : '';
        $data['updated_by'] = Auth::id();

        $updated = $this->expenseRepository->update($expense, $data);

        if ($updated) {
            $expense->refresh();
            $newData = $this->getHistoryPayload($expense);
            $changedFields = $this->getChangedFields($oldData, $newData);

            ExpenseHistory::create([
                'expense_id' => $expense->id,
                'user_id' => Auth::id(),
                'action' => 'updated',
                'old_data' => $oldData,
                'new_data' => $newData,
                'changed_fields' => implode(',', $changedFields),
            ]);
        }

        return $updated;
    }

    public function delete(int $id): bool
    {
        $expense = $this->findById($id);
        if (!$expense) {
            return false;
        }

        ExpenseHistory::create([
            'expense_id' => $expense->id,
            'user_id' => Auth::id(),
            'action' => 'deleted',
            'old_data' => $this->getHistoryPayload($expense),
            'new_data' => null,
            'changed_fields' => 'title,amount,date,description',
        ]);

        return $this->expenseRepository->delete($expense);
    }

    public function getCategories()
    {
        return $this->expenseRepository->getCategories();
    }

    private function getHistoryPayload(Expense $expense): array
    {
        $expense->loadMissing(['user', 'updater']);

        return [
            'title' => $expense->title,
            'amount' => (float) $expense->amount,
            'date' => optional($expense->date)->format('Y-m-d'),
            'description' => $expense->description,
            'category_id' => $expense->category_id,
            'created_by_id' => $expense->user_id,
            'created_by_name' => $expense->user->name ?? '-',
            'updated_by_id' => $expense->updated_by,
            'updated_by_name' => $expense->updater->name ?? '-',
            'created_at' => optional($expense->created_at)->format('Y-m-d H:i:s'),
            'updated_at' => optional($expense->updated_at)->format('Y-m-d H:i:s'),
        ];
    }

    private function getChangedFields(array $oldData, array $newData): array
    {
        $fields = ['title', 'amount', 'date', 'description', 'category_id'];

        return collect($fields)
            ->filter(fn($field) => (string) ($oldData[$field] ?? '') !== (string) ($newData[$field] ?? ''))
            ->values()
            ->all();
    }
}
