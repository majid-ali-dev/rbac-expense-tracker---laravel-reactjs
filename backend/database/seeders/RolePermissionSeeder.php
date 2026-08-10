<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Assign permissions to roles. Access is granted ONLY through these
     * database assignments — no role name is special-cased in code.
     */
    public function run(): void
    {
        $allPermissionIds = Permission::query()->pluck('id')->all();

        $byName = function (array $names) {
            return Permission::query()->whereIn('name', $names)->pluck('id')->all();
        };

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->permissions()->sync($allPermissionIds);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->permissions()->sync($allPermissionIds);

        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->permissions()->sync($byName([
            'dashboard.view',
            'categories.view',
            'expenses.view',
            'expenses.view-all',
            'expenses.create',
            'expenses.edit',
            'expenses.edit-all',
            'expenses.export',
            'expenses.download',
            'notifications.view',
        ]));

        $member = Role::firstOrCreate(['name' => 'member']);
        $member->permissions()->sync($byName([
            'dashboard.view',
            'expenses.view',
            'payments.view',
            'notifications.view',
        ]));
    }
}
