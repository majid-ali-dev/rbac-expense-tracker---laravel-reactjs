<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseSheetRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_expenses_sheet_route_returns_expense_report_data_for_users_with_view_permission(): void
    {
        $permission = Permission::create(['name' => 'view-expense']);
        $role = Role::create(['name' => 'staff']);
        $role->permissions()->attach($permission);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);
        $user->roles()->attach($role);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/expenses/sheet?from=2024-01-01&to=2024-01-31');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'expenses',
                    'total_expenses',
                    'total_paid',
                    'remaining_balance',
                    'extra_balance',
                ],
            ]);
    }
}
