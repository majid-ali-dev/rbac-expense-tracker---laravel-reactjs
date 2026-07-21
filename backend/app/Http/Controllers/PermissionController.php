<?php

namespace App\Http\Controllers;

use App\Http\Requests\Permission\PermissionStoreRequest;
use App\Http\Requests\Permission\PermissionUpdateRequest;
use App\Http\Resources\PermissionResource;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    protected PermissionService $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10); // Changed from 15 to 10
        $permissions = $this->permissionService->getAllPaginated($perPage);

        return response()->json([
            'success' => true,
            'data' => PermissionResource::collection($permissions),
            'meta' => [
                'current_page' => $permissions->currentPage(),
                'per_page' => $permissions->perPage(),
                'total' => $permissions->total(),
                'last_page' => $permissions->lastPage(),
            ],
        ]);
    }

    public function store(PermissionStoreRequest $request): JsonResponse
    {
        try {
            $permission = $this->permissionService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Permission created successfully',
                'data' => new PermissionResource($permission),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $permission = $this->permissionService->findById($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PermissionResource($permission),
        ]);
    }

    public function update(PermissionUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $updated = $this->permissionService->update($id, $request->validated());

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission not found',
                ], 404);
            }

            $permission = $this->permissionService->findById($id);

            return response()->json([
                'success' => true,
                'message' => 'Permission updated successfully',
                'data' => new PermissionResource($permission),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->permissionService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permission deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function allPermissions(): JsonResponse
    {
        $permissions = $this->permissionService->getAllPermissions();

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }
}
