<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'super_admin']);
        Role::firstOrCreate(['name' => 'manager']);
        Role::firstOrCreate(['name' => 'staff']);
        Role::firstOrCreate(['name' => 'member']);
    }
}