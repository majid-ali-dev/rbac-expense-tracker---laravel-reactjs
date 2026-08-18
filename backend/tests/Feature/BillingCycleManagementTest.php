<?php

namespace Tests\Feature;

use App\Models\BillingCycle;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class BillingCycleManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'super_admin']);
        foreach (['billing-cycle.view', 'billing-cycle.create', 'billing-cycle.edit', 'billing-cycle.close'] as $name) {
            $adminRole->permissions()->attach(Permission::create(['name' => $name]));
        }

        $memberRole = Role::create(['name' => 'member']);
        $memberRole->permissions()->attach(Permission::create(['name' => 'billing-cycle.view']));

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->member = User::create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $this->member->roles()->attach($memberRole);

        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_create_cycle_requires_billing_cycle_create_permission(): void
    {
        $this->actingAs($this->member, 'sanctum');

        $this->postJson('/api/billing-cycle', [
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-30',
        ])->assertStatus(403);
    }

    public function test_admin_can_create_a_cycle(): void
    {
        $response = $this->postJson('/api/billing-cycle', [
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-30',
        ]);

        $response->assertStatus(201);
        $this->assertSame('2026-09-01', BillingCycle::latest('start_date')->first()->start_date->format('Y-m-d'));
        $this->assertSame('open', BillingCycle::latest('start_date')->first()->status);
    }

    public function test_create_cycle_requires_valid_dates(): void
    {
        // end before start -> 422
        $this->postJson('/api/billing-cycle', [
            'start_date' => '2026-09-30',
            'end_date' => '2026-09-01',
        ])->assertStatus(422);

        // missing dates -> 422
        $this->postJson('/api/billing-cycle', [
            'start_date' => '2026-09-01',
        ])->assertStatus(422);
    }

    public function test_admin_can_update_a_cycle_dates(): void
    {
        $cycle = BillingCycle::create([
            'label' => 'Test Cycle',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
            'status' => 'closed',
            'total_expense' => 0,
            'total_paid' => 0,
        ]);

        $this->putJson("/api/billing-cycle/{$cycle->id}", [
            'start_date' => '2026-08-05',
            'end_date' => '2026-08-25',
        ])->assertStatus(200);

        $cycle->refresh();
        $this->assertSame('2026-08-05', $cycle->start_date->format('Y-m-d'));
        $this->assertSame('2026-08-25', $cycle->end_date->format('Y-m-d'));
    }

    public function test_update_cycle_requires_billing_cycle_edit_permission(): void
    {
        $cycle = BillingCycle::create([
            'label' => 'Test Cycle',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
            'status' => 'open',
            'total_expense' => 0,
            'total_paid' => 0,
        ]);

        $this->actingAs($this->member, 'sanctum');

        $this->putJson("/api/billing-cycle/{$cycle->id}", [
            'start_date' => '2026-08-05',
            'end_date' => '2026-08-25',
        ])->assertStatus(403);
    }

    public function test_update_missing_cycle_returns_404(): void
    {
        $this->putJson('/api/billing-cycle/9999', [
            'start_date' => '2026-08-05',
            'end_date' => '2026-08-25',
        ])->assertStatus(404);
    }

    public function test_all_cycles_requires_billing_cycle_view_permission(): void
    {
        $this->actingAs($this->member, 'sanctum');
        $this->getJson('/api/billing-cycle/all')->assertOk();

        // A user with NO billing-cycle.view must not be able to list cycles.
        $noViewRole = Role::create(['name' => 'staff']);
        $noViewRole->permissions()->attach(Permission::create(['name' => 'dashboard.view']));
        $staff = User::create([
            'name' => 'Staff',
            'email' => 'staff@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $staff->roles()->attach($noViewRole);

        $this->actingAs($staff, 'sanctum');
        $this->getJson('/api/billing-cycle/all')->assertStatus(403);
    }

    public function test_current_cycle_is_available_to_every_authenticated_user(): void
    {
        $noViewRole = Role::create(['name' => 'staff']);
        $noViewRole->permissions()->attach(Permission::create(['name' => 'dashboard.view']));
        $staff = User::create([
            'name' => 'Staff',
            'email' => 'staff@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $staff->roles()->attach($noViewRole);

        BillingCycle::create([
            'label' => 'Active Cycle',
            'start_date' => Carbon::now()->startOfMonth(),
            'end_date' => Carbon::now()->endOfMonth(),
            'status' => 'open',
            'total_expense' => 0,
            'total_paid' => 0,
        ]);

        $this->actingAs($staff, 'sanctum');
        $this->getJson('/api/billing-cycle/current')->assertOk();
    }
}
