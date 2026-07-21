<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Requests\Role\RoleUpdateRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $roles = $this->roleService->getAllPaginated($perPage);

        return response()->json([
            'success' => true,
            'data' => RoleResource::collection($roles),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
                'last_page' => $roles->lastPage(),
            ],
        ]);
    }

    public function store(RoleStoreRequest $request): JsonResponse
    {
        try {
            $role = $this->roleService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => new RoleResource($role),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $role = $this->roleService->findById($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new RoleResource($role),
        ]);
    }

    public function update(RoleUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $updated = $this->roleService->update($id, $request->validated());

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found',
                ], 404);
            }

            $role = $this->roleService->findById($id);

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => new RoleResource($role),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->roleService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function allRoles(): JsonResponse
    {
        $roles = $this->roleService->getAllRoles();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}