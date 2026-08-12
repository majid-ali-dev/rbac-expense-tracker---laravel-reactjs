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
     * Show expenses for the given billing cycle (defaults to the current one).
     * The cycle is resolved via the permanent billing_cycle_id attribution;
     * the unassigned-by-date safety net is handled by Expense::scopeInCycle.
     */
    public function getAllPaginated(int $perPage = 10, ?int $cycleId = null): LengthAwarePaginator
    {
        $user = Auth::user();
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();

        $query = $this->expenseRepository->getExpenseQuery($user);

        if ($cycle) {
            $query->inCycle($cycle);
        }

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

        // Attach the expense to the cycle whose date range contains its date,
        // so it is permanently traceable to the correct billing cycle.
        $data['billing_cycle_id'] = $this->resolveCycleIdForDate($data['date']);

        // Closed cycles are immutable — never allow creating an expense into one.
        BillingCycle::assertCycleWritable($data['billing_cycle_id']);

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

        // Block any update that touches a closed cycle — either the cycle the
        // expense currently belongs to, or the cycle it would move to if its
        // date changed (legacy expenses without a cycle are matched by date).
        $currentCycleId = $expense->billing_cycle_id ?: $this->resolveCycleIdForDate($expense->date?->format('Y-m-d') ?? '');
        BillingCycle::assertCycleWritable($currentCycleId);

        if (isset($data['date']) && $data['date'] && $expense->date?->format('Y-m-d') !== $data['date']) {
            $data['billing_cycle_id'] = $this->resolveCycleIdForDate($data['date']);
            BillingCycle::assertCycleWritable($data['billing_cycle_id']);
        }

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

        // Closed cycles are immutable — never allow deleting their expenses.
        $cycleId = $expense->billing_cycle_id ?: $this->resolveCycleIdForDate($expense->date?->format('Y-m-d') ?? '');
        BillingCycle::assertCycleWritable($cycleId);

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

    /**
     * Resolve the billing cycle that contains the given date.
     * Returns null when no cycle range covers the date (e.g. before the
     * first cycle ever started).
     */
    private function resolveCycleIdForDate(string $date): ?int
    {
        return BillingCycle::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->latest('start_date')
            ->value('id');
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
