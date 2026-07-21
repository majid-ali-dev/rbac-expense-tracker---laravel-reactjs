<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $managerRole = Role::where('name', 'manager')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $memberRole = Role::where('name', 'member')->first();

        if (!$superAdminRole || !$managerRole || !$staffRole || !$memberRole) {
            $this->command->error('Roles not found. Run RoleSeeder first.');
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $users = [
            // Super Admin
            [
                'name' => 'Majid Baloch',
                'email' => 'superadmin@gmail.com',
                'phone' => '0300-1111111',
                
                'role' => $superAdminRole,
                'total_amount' => 0,
                'status' => 'paid'
            ],
            // Manager
            [
                'name' => 'Nadeem Khan',
                'email' => 'manager@gmail.com',
                'phone' => '0300-2222222',
                'role' => $managerRole,
                'total_amount' => 0,
                'status' => 'paid'
            ],
            // Staff
            [
                'name' => 'Kashif Ali',
                'email' => 'staff@gmail.com',
                'phone' => '0300-3333333',
                'role' => $staffRole,
                'total_amount' => 0,
                'status' => 'paid'
            ],
            // Members
            [
                'name' => 'Nadeem Ali',
                'email' => 'nadeem@gmail.com',
                'phone' => '0301-1111111',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'partial'
            ],
            [
                'name' => 'Naseer Ali',
                'email' => 'naseer@gmail.com',
                'phone' => '0301-2222222',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'partial'
            ],
            [
                'name' => 'Gaffar Ali',
                'email' => 'gaffar@gmail.com',
                'phone' => '0301-3333333',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'unpaid'
            ],
            [
                'name' => 'Majid Ali',
                'email' => 'majid@gmail.com',
                'phone' => '0301-4444444',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'paid'
            ],
            [
                'name' => 'Qamber Ali',
                'email' => 'qamber@gmail.com',
                'phone' => '0301-5555555',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'unpaid'
            ],
            [
                'name' => 'Sahib Hussain',
                'email' => 'sahib@gmail.com',
                'phone' => '0301-6666666',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'partial'
            ],
            [
                'name' => 'Ahsin Raza',
                'email' => 'ahsin@gmail.com',
                'phone' => '0301-7777777',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'paid'
            ],
            [
                'name' => 'Faheem Hussain',
                'email' => 'faheem@gmail.com',
                'phone' => '0301-8888888',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'partial'
            ],
            [
                'name' => 'Raza Hussain',
                'email' => 'raza@gmail.com',
                'phone' => '0301-9999999',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'unpaid'
            ],
            [
                'name' => 'Faiq',
                'email' => 'faiq@gmail.com',
                'phone' => '0302-0000000',
                'role' => $memberRole,
                'total_amount' => 0,
                'status' => 'paid'
            ]
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            
            $user = User::create(array_merge($userData, [
                'password' => Hash::make('12345'),
                'email_verified_at' => now(),
            ]));
            
            $user->roles()->attach($role->id);
        }

        $this->command->info('Users seeded successfully. Total: ' . User::count());
    }
}