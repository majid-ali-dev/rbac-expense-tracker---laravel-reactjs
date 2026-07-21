<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [

            // 🔵 USER MANAGEMENT
            'manage-users',
            'assign-roles',
            'view-all-data',

            // 🔵 EXPENSE MANAGEMENT
            'view-expense',
            'create-expense',
            'edit-expense',
            'delete-expense',
            'download-expense',
            'manage-categories',
            'view-all-expenses',

            // 🔵 PAYMENT MANAGEMENT
            'create-payment',
            'view-payment',

            // 🔵 MEMBER FEATURES
            'view-own-data',
            'pay-bills',
        ];

        foreach (array_unique($permissions) as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
