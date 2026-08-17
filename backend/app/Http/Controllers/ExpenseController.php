<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expense\ExpenseStoreRequest;
use App\Http\Requests\Expense\ExpenseUpdateRequest;
use App\Http\Resources\ExpenseResource;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    protected ExpenseService $expenseService;

    public function __construct(ExpenseService $expenseService)
    {
        $this->expenseService = $expenseService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        $cycleId = $request->integer('cycle_id') ?: null;
        $expenses = $this->expenseService->getAllPaginated($perPage, $cycleId);

        return response()->json([
            'success' => true,
            'data' => ExpenseResource::collection($expenses),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'per_page' => $expenses->perPage(),
                'total' => $expenses->total(),
                'last_page' => $expenses->lastPage(),
            ],
        ]);
    }

    public function store(ExpenseStoreRequest $request): JsonResponse
    {
        $expense = $this->expenseService->create(
            $request->safe()->except(['cycle_id']),
            $request->integer('cycle_id') ?: null
        );

        return response()->json([
            'success' => true,
            'message' => 'Expense added successfully',
            'data' => new ExpenseResource($expense->load(['user', 'category', 'histories.user'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = auth()->user();
        $expense = $this->expenseService->findById($id);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        if (!$user->canModify('expenses.view', 'expenses.view-all', $expense->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this expense.',
            ], 403);
        }

        // Load histories with user for detailed view
        $expense->load(['user', 'category', 'histories.user']);

        return response()->json([
            'success' => true,
            'data' => new ExpenseResource($expense),
        ]);
    }

    public function update(ExpenseUpdateRequest $request, int $id): JsonResponse
    {
        $expense = $this->expenseService->findById($id);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        if (!auth()->user()->canModify('expenses.edit', 'expenses.edit-all', $expense->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this expense.',
            ], 403);
        }

        $updated = $this->expenseService->update(
            $id,
            $request->safe()->except(['cycle_id']),
            $request->integer('cycle_id') ?: null
        );

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        $expense = $this->expenseService->findById($id);

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully',
            'data' => new ExpenseResource($expense->load(['user', 'category', 'histories.user'])),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $expense = $this->expenseService->findById($id);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        if (!auth()->user()->canModify('expenses.delete', 'expenses.delete-all', $expense->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this expense.',
            ], 403);
        }

        $deleted = $this->expenseService->delete($id, $request->integer('cycle_id') ?: null);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully',
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = $this->expenseService->getCategories();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}