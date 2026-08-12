<?php

namespace Tests\Feature;

use App\Models\BillingCycle;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

/**
 * Closed (historical) billing cycles are read-only EVERYWHERE. Even if the UI
 * is bypassed with a direct API call, create/update/delete targeting a closed
 * cycle's data must be rejected with a 409.
 */
class ClosedCycleReadOnlyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private BillingCycle $openCycle;
    private BillingCycle $closedCycle;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $permissionNames = [
            'expenses.create', 'expenses.edit', 'expenses.edit-all',
            'expenses.delete', 'expenses.delete-all',
            'categories.create', 'categories.edit', 'categories.delete',
            'users.create', 'users.edit', 'users.delete',
            'payments.delete',
        ];
        $role = Role::create(['name' => 'super_admin']);
        foreach ($permissionNames as $name) {
            $role->permissions()->attach(Permission::create(['name' => $name]));
        }

        $memberRole = Role::create(['name' => 'member']);

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $this->admin->roles()->attach($role);

        $this->member = User::create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $this->member->roles()->attach($memberRole);

        $now = Carbon::now();

        // Historical (sealed) cycle in the recent past.
        $this->closedCycle = BillingCycle::create([
            'label' => 'Past Cycle',
            'start_date' => $now->copy()->subMonth()->startOfMonth(),
            'end_date' => $now->copy()->subMonth()->endOfMonth(),
            'status' => 'closed',
        ]);

        // Current open cycle.
        $this->openCycle = BillingCycle::create([
            'label' => 'Current Cycle',
            'start_date' => $now->copy()->startOfMonth(),
            'end_date' => $now->copy()->endOfMonth(),
            'status' => 'open',
        ]);

        $this->category = Category::create(['name' => 'Food']);

        $this->actingAs($this->admin, 'sanctum');
    }

    // ===== Expenses (cycle is derived from the expense date) =====

    public function test_expense_cannot_be_created_into_a_closed_cycle(): void
    {
        $this->postJson('/api/expenses', [
            'category_id' => $this->category->id,
            'amount' => 500,
            'date' => $this->closedCycle->end_date->format('Y-m-d'),
            'description' => '',
        ])->assertStatus(409);

        $this->assertSame(0, Expense::count());
    }

    public function test_expense_in_a_closed_cycle_cannot_be_updated(): void
    {
        $expense = $this->closedCycleExpense();

        $this->putJson("/api/expenses/{$expense->id}", [
            'category_id' => $this->category->id,
            'amount' => 999,
            'date' => $this->closedCycle->end_date->format('Y-m-d'),
            'description' => '',
        ])->assertStatus(409);

        $this->assertEqualsWithDelta(100, (float) $expense->fresh()->amount, 0.01);
    }

    public function test_expense_in_a_closed_cycle_cannot_be_deleted(): void
    {
        $expense = $this->closedCycleExpense();

        $this->deleteJson("/api/expenses/{$expense->id}")->assertStatus(409);

        $this->assertNotNull($expense->fresh());
    }

    public function test_expense_can_still_be_created_in_the_open_cycle(): void
    {
        $this->postJson('/api/expenses', [
            'category_id' => $this->category->id,
            'amount' => 300,
            'date' => $this->openCycle->start_date->format('Y-m-d'),
            'description' => '',
        ])->assertStatus(201);

        $this->assertSame(1, Expense::count());
    }

    // ===== Categories (master records — guard uses the request cycle_id) =====

    public function test_category_create_with_closed_cycle_context_is_rejected(): void
    {
        $this->postJson('/api/categories', [
            'name' => 'Rent',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(409);

        $this->assertSame(1, Category::count());
    }

    public function test_category_update_with_closed_cycle_context_is_rejected(): void
    {
        $this->putJson("/api/categories/{$this->category->id}", [
            'name' => 'Food & Drinks',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(409);

        $this->assertSame('Food', $this->category->fresh()->name);
    }

    public function test_category_delete_with_closed_cycle_context_is_rejected(): void
    {
        $this->deleteJson("/api/categories/{$this->category->id}?cycle_id={$this->closedCycle->id}")
            ->assertStatus(409);

        $this->assertNotNull($this->category->fresh());
    }

    public function test_category_create_with_open_cycle_context_is_allowed(): void
    {
        $this->postJson('/api/categories', [
            'name' => 'Rent',
            'cycle_id' => $this->openCycle->id,
        ])->assertStatus(201);

        $this->assertSame(2, Category::count());
    }

    // ===== Users (master records — guard uses the request cycle_id) =====

    public function test_user_create_with_closed_cycle_context_is_rejected(): void
    {
        $this->postJson('/api/users', [
            'name' => 'New Member',
            'email' => 'new@example.com',
            'phone' => '03001234567',
            'password' => 'secret123',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(409);

        $this->assertSame(2, User::count());
    }

    public function test_user_update_with_closed_cycle_context_is_rejected(): void
    {
        $this->putJson("/api/users/{$this->member->id}", [
            'name' => 'Renamed Member',
            'email' => $this->member->email,
            'phone' => '03001112222',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(409);

        $this->assertSame('Member', $this->member->fresh()->name);
    }

    public function test_user_delete_with_closed_cycle_context_is_rejected(): void
    {
        $this->deleteJson("/api/users/{$this->member->id}?cycle_id={$this->closedCycle->id}")
            ->assertStatus(409);

        $this->assertNotNull($this->member->fresh());
    }

    // ===== Payments =====

    public function test_payment_in_a_closed_cycle_cannot_be_deleted(): void
    {
        $payment = Payment::create([
            'user_id' => $this->member->id,
            'billing_cycle_id' => $this->closedCycle->id,
            'paid_amount' => 1000,
            'month' => strtolower(now()->format('M')),
        ]);

        $this->deleteJson("/api/payments/{$payment->id}")->assertStatus(409);

        $this->assertNotNull($payment->fresh());
    }

    private function closedCycleExpense(): Expense
    {
        return Expense::create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'billing_cycle_id' => $this->closedCycle->id,
            'title' => $this->category->name,
            'amount' => 100,
            'date' => $this->closedCycle->end_date,
        ]);
    }
}
