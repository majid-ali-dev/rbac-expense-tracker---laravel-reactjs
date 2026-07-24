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
        $expenses = $this->expenseService->getAllPaginated($perPage);

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
        $expense = $this->expenseService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Expense added successfully',
            'data' => new ExpenseResource($expense->load(['user', 'category'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $expense = $this->expenseService->findById($id);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ExpenseResource($expense->load(['user', 'category'])),
        ]);
    }

    public function update(ExpenseUpdateRequest $request, int $id): JsonResponse
    {
        $updated = $this->expenseService->update($id, $request->validated());

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
            'data' => new ExpenseResource($expense->load(['user', 'category'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->expenseService->delete($id);

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
