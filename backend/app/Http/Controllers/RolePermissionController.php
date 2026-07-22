<?php

namespace App\Http\Controllers;

use App\Http\Requests\RolePermission\RolePermissionUpdateRequest;
use App\Http\Resources\RolePermissionResource;
use App\Models\Permission;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        $roles = Role::with('permissions')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => RolePermissionResource::collection($roles),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
                'last_page' => $roles->lastPage(),
            ],
        ]);
    }

    public function edit(int $id): JsonResponse
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return response()->json([
            'success' => true,
            'data' => [
                'role' => new RolePermissionResource($role),
                'all_permissions' => $permissions,
            ],
        ]);
    }

    public function update(RolePermissionUpdateRequest $request, int $id): JsonResponse
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $role->permissions()->sync($request->permissions ?? []);

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Permissions assigned successfully',
            'data' => new RolePermissionResource($role),
        ]);
    }
}
