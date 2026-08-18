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
 * Closed (historical) billing cycles are protected UNLESS the caller
 * explicitly selects the cycle via cycle_id. Without an explicit selection the
 * create/update/delete of a closed cycle's data is rejected with a 409; with an
 * explicit selection (the new global cycle picker) closed cycles stay fully
 * editable, exactly like the current cycle.
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
            'payments.create', 'payments.delete',
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

    // ===== Expenses =====

    public function test_expense_cannot_be_created_into_a_closed_cycle_without_explicit_selection(): void
    {
        // No cycle_id: the cycle is derived from the expense date -> closed -> 409.
        $this->postJson('/api/expenses', [
            'category_id' => $this->category->id,
            'amount' => 500,
            'date' => $this->closedCycle->end_date->format('Y-m-d'),
            'description' => '',
        ])->assertStatus(409);

        $this->assertSame(0, Expense::count());
    }

    public function test_expense_can_be_created_into_a_closed_cycle_when_explicitly_selected(): void
    {
        // Explicit cycle_id unlocks the closed cycle — writes go to that cycle.
        $this->postJson('/api/expenses', [
            'category_id' => $this->category->id,
            'amount' => 500,
            'date' => $this->closedCycle->end_date->format('Y-m-d'),
            'description' => '',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(201);

        $expense = Expense::first();
        $this->assertNotNull($expense);
        $this->assertSame($this->closedCycle->id, $expense->billing_cycle_id);
    }

    public function test_expense_in_a_closed_cycle_cannot_be_updated_without_explicit_selection(): void
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

    public function test_expense_in_a_closed_cycle_can_be_updated_when_explicitly_selected(): void
    {
        $expense = $this->closedCycleExpense();

        $this->putJson("/api/expenses/{$expense->id}", [
            'category_id' => $this->category->id,
            'amount' => 999,
            'date' => $this->closedCycle->end_date->format('Y-m-d'),
            'description' => '',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(200);

        $expense->refresh();
        $this->assertEqualsWithDelta(999, (float) $expense->amount, 0.01);
        $this->assertSame($this->closedCycle->id, $expense->billing_cycle_id);
    }

    public function test_expense_in_a_closed_cycle_cannot_be_deleted_without_explicit_selection(): void
    {
        $expense = $this->closedCycleExpense();

        $this->deleteJson("/api/expenses/{$expense->id}")->assertStatus(409);

        $this->assertNotNull($expense->fresh());
    }

    public function test_expense_in_a_closed_cycle_can_be_deleted_when_explicitly_selected(): void
    {
        $expense = $this->closedCycleExpense();

        $this->deleteJson("/api/expenses/{$expense->id}?cycle_id={$this->closedCycle->id}")
            ->assertStatus(200);

        $this->assertNull($expense->fresh());
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
        $this->assertSame($this->openCycle->id, Expense::first()->billing_cycle_id);
    }

    // ===== Categories (master records) =====

    public function test_category_create_with_closed_cycle_context_is_allowed(): void
    {
        $this->postJson('/api/categories', [
            'name' => 'Rent',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(201);

        $this->assertSame(2, Category::count());
    }

    public function test_category_update_with_closed_cycle_context_is_allowed(): void
    {
        $this->putJson("/api/categories/{$this->category->id}", [
            'name' => 'Food & Drinks',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(200);

        $this->assertSame('Food & Drinks', $this->category->fresh()->name);
    }

    public function test_category_delete_with_closed_cycle_context_is_allowed(): void
    {
        $this->deleteJson("/api/categories/{$this->category->id}?cycle_id={$this->closedCycle->id}")
            ->assertStatus(200);

        $this->assertNull($this->category->fresh());
    }

    // ===== Users (master records) =====

    public function test_user_create_with_closed_cycle_context_is_allowed(): void
    {
        $this->postJson('/api/users', [
            'name' => 'New Member',
            'email' => 'new@example.com',
            'phone' => '03001234567',
            'password' => 'secret123',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(201);

        $this->assertSame(3, User::count());
    }

    public function test_user_update_with_closed_cycle_context_is_allowed(): void
    {
        $this->putJson("/api/users/{$this->member->id}", [
            'name' => 'Renamed Member',
            'email' => $this->member->email,
            'phone' => '03001112222',
            'cycle_id' => $this->closedCycle->id,
        ])->assertStatus(200);

        $this->assertSame('Renamed Member', $this->member->fresh()->name);
    }

    // ===== Payments =====

    public function test_payment_in_a_closed_cycle_cannot_be_deleted_without_explicit_selection(): void
    {
        $payment = $this->closedCyclePayment();

        $this->deleteJson("/api/payments/{$payment->id}")->assertStatus(409);

        $this->assertNotNull($payment->fresh());
    }

    public function test_payment_in_a_closed_cycle_can_be_deleted_when_explicitly_selected(): void
    {
        $payment = $this->closedCyclePayment();

        $this->deleteJson("/api/payments/{$payment->id}?cycle_id={$this->closedCycle->id}")
            ->assertStatus(200);

        $this->assertNull($payment->fresh());
    }

    public function test_payment_can_be_recorded_into_a_closed_cycle_when_explicitly_selected(): void
    {
        $response = $this->postJson("/api/payments/{$this->member->id}/pay", [
            'paid_amount' => 1000,
            'cycle_id' => $this->closedCycle->id,
        ]);

        $response->assertStatus(201);

        $payment = Payment::first();
        $this->assertNotNull($payment);
        $this->assertSame($this->closedCycle->id, $payment->billing_cycle_id);
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

    private function closedCyclePayment(): Payment
    {
        return Payment::create([
            'user_id' => $this->member->id,
            'billing_cycle_id' => $this->closedCycle->id,
            'paid_amount' => 1000,
            'month' => strtolower(now()->format('M')),
        ]);
    }
}
