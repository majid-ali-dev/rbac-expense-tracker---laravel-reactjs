<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allPermissionIds = Permission::query()->pluck('id')->all();

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->permissions()->sync($allPermissionIds);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->permissions()->sync($allPermissionIds);

        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->permissions()->sync(
            Permission::query()->whereIn('name', [
                'view-expense',
                'create-expense',
                'edit-expense',
            ])->pluck('id')->all()
        );

        $member = Role::firstOrCreate(['name' => 'member']);
        $member->permissions()->sync(
            Permission::query()->whereIn('name', [
                'view-own-data',
                'view-payment',
                'pay-bills',
            ])->pluck('id')->all()
        );
    }
}
