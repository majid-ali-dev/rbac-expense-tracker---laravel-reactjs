<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UserStoreRequest;
use App\Http\Requests\User\UserTotalUpdateRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Resources\UserProfileResource;
use App\Http\Resources\UserResource;
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
        $users = $this->userService->getAllMembers($perPage);

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

        // Assign roles
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

    public function show(int $id): JsonResponse
    {
        $userData = $this->userService->getUserWithPaymentHistory($id);

        if (!$userData) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new UserProfileResource($userData),
        ]);
    }

    public function update(UserUpdateRequest $request, int $id): JsonResponse
    {
        $updated = $this->userService->update($id, $request->validated());

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
        $updated = $this->userService->updateTotal($id, $request->total_amount);

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'User not found or amount is less than paid amount',
            ], 400);
        }

        $user = $this->userService->findById($id);

        return response()->json([
            'success' => true,
            'message' => 'Total amount updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(int $id): JsonResponse
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
}
