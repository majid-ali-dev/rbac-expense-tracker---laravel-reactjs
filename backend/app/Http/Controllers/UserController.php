<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UserStoreRequest;
use App\Http\Requests\User\UserTotalUpdateRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\BillingCycle;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        $cycle = $this->resolveCycle($request);
        $users = $this->userService->getAllMembers($perPage, $cycle->id);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        $roleIds = $request->roles ?? [];
        if (empty($roleIds)) {
            $memberRole = $this->userService->getRoles()->where('name', 'member')->first();
            if ($memberRole) {
                $roleIds = [$memberRole->id];
            }
        }
        $user->roles()->sync($roleIds);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => new UserResource($user->load('roles')),
        ], 201);
    }

    /**
     * Get single user profile + payment history.
     * Uses the SAME service method (getUserWithPaymentHistory) that returns
     * the { user, payment_history } shape the frontend expects — this is the
     * fix for the "User not found" bug caused by a response-shape mismatch.
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $cycle = $this->resolveCycle($request);
        $result = $this->userService->getUserWithPaymentHistory($id, $cycle->id);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function update(UserUpdateRequest $request, int $id): JsonResponse
    {
        $cycle = $this->resolveCycle($request);
        $updated = $this->userService->update($id, $request->validated(), $cycle->id);

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $user = $this->userService->findById($id);
        $user->roles()->sync($request->roles ?? []);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => new UserResource($user->load('roles')),
        ]);
    }

    public function updateTotal(UserTotalUpdateRequest $request, int $id): JsonResponse
    {
        $cycle = $this->resolveCycle($request);
        $updated = $this->userService->updateTotal($id, $request->total_amount, $cycle->id);

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 400);
        }

        $user = $this->userService->findById($id);

        return response()->json([
            'success' => true,
            'message' => 'Total amount updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->userService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    public function allRoles(): JsonResponse
    {
        $roles = $this->userService->getRoles();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Resolve the selected cycle from the request and stash it on the request
     * so nested resources (e.g. UserResource) serialize cycle-scoped values
     * without re-querying.
     */
    private function resolveCycle(Request $request): BillingCycle
    {
        $cycleId = $request->integer('cycle_id') ?: null;
        $cycle = $cycleId ? BillingCycle::find($cycleId) : null;
        $cycle = $cycle ?: BillingCycle::current();

        $request->attributes->set('billing_cycle', $cycle);

        return $cycle;
    }
}