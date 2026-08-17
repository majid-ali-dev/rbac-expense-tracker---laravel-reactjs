<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Canonical permission list. Naming: module.action (module.action-all for
     * "all records" scope). Keep in sync with the frontend permission checks
     * and the actual buttons/actions in the project.
     */
    public function run(): void
    {
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Roles
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Permissions
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',

            // Roles & Permissions
            'role-permissions.view',
            'role-permissions.update',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Categories
            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',

            // Expenses
            'expenses.view',
            'expenses.view-all',
            'expenses.create',
            'expenses.edit',
            'expenses.edit-all',
            'expenses.delete',
            'expenses.delete-all',
            'expenses.export',
            'expenses.download',

            // Payments
            'payments.view',
            'payments.view-all',
            'payments.create',
            'payments.delete',

            // Billing cycle
            'billing-cycle.view',
            'billing-cycle.create',
            'billing-cycle.edit',
            'billing-cycle.close',

            // Notifications
            'notifications.view',
            'notifications.create',
            'notifications.edit',
            'notifications.delete',
        ];

        // Remove any legacy/renamed permissions not in the canonical list,
        // then ensure the canonical ones exist.
        Permission::whereNotIn('name', $permissions)->delete();

        foreach (array_unique($permissions) as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
