<?php

namespace Tests\Feature;

use App\Models\BillingCycle;
use App\Models\Expense;
use App\Models\MemberDue;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class BillingCycleCloseTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private BillingCycle $cycle;

    protected function setUp(): void
    {
        parent::setUp();

        $permission = Permission::create(['name' => 'billing-cycle.close']);
        $role = Role::create(['name' => 'super_admin']);
        $role->permissions()->attach($permission);

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
            'total_amount' => 5000,
            'status' => 'partial',
        ]);
        $this->member->roles()->attach($memberRole);

        // Explicit open cycle: 1st -> 31st of the current month
        $this->cycle = BillingCycle::create([
            'label' => 'Test Cycle (Cycle 1)',
            'start_date' => Carbon::now()->startOfMonth(),
            'end_date' => Carbon::now()->endOfMonth(),
            'status' => 'open',
            'total_expense' => 0,
            'total_paid' => 0,
        ]);

        MemberDue::create([
            'user_id' => $this->member->id,
            'billing_cycle_id' => $this->cycle->id,
            'amount_assigned' => 5000,
            'amount_paid' => 1000,
        ]);

        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_close_with_selected_range_seals_cycle_and_attaches_expenses(): void
    {
        $today = Carbon::now()->startOfDay();
        $inRange = Expense::create([
            'user_id' => $this->member->id,
            'category_id' => null,
            'title' => 'In range',
            'amount' => 2000,
            'date' => $today->copy()->subDays(3),
        ]);
        // An expense dated AFTER the selected close end must stay out of the
        // closed cycle (it belongs to the next cycle).
        Expense::create([
            'user_id' => $this->member->id,
            'category_id' => null,
            'title' => 'Future',
            'amount' => 1500,
            'date' => $today->copy()->addDays(2),
        ]);

        Payment::create([
            'user_id' => $this->member->id,
            'billing_cycle_id' => $this->cycle->id,
            'paid_amount' => 1000,
            'month' => strtolower(now()->format('M')),
        ]);

        $response = $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
            'start_date' => $this->cycle->start_date->format('Y-m-d'),
            'end_date' => $today->format('Y-m-d'),
        ]);

        $response->assertOk();

        $closed = $this->cycle->fresh();
        $this->assertSame('closed', $closed->status);
        $this->assertSame($today->format('Y-m-d'), $closed->end_date->format('Y-m-d'));
        $this->assertEqualsWithDelta(2000, (float) $closed->total_expense, 0.01);
        $this->assertEqualsWithDelta(1000, (float) $closed->total_paid, 0.01);

        // In-range expense is now permanently attached to the closed cycle
        $this->assertSame($closed->id, $inRange->fresh()->billing_cycle_id);

        // A new open cycle starts the day after the selected end date
        $newCycle = BillingCycle::where('status', 'open')->latest('start_date')->first();
        $this->assertNotNull($newCycle);
        $this->assertSame($today->copy()->addDay()->format('Y-m-d'), $newCycle->start_date->format('Y-m-d'));

        // Future-dated expense belongs to the new cycle (nothing lost)
        $this->assertSame($newCycle->id, Expense::where('title', 'Future')->first()->billing_cycle_id);

        // Member due snapshot preserved for the closed cycle
        $due = MemberDue::where('user_id', $this->member->id)
            ->where('billing_cycle_id', $closed->id)
            ->first();
        $this->assertEqualsWithDelta(5000, (float) $due->amount_assigned, 0.01);
        $this->assertEqualsWithDelta(1000, (float) $due->amount_paid, 0.01);

        // Operational values reset for the new cycle
        $this->assertEqualsWithDelta(0, (float) $this->member->fresh()->total_amount, 0.01);
        $this->assertSame('unpaid', $this->member->fresh()->status);
    }

    public function test_double_close_is_rejected(): void
    {
        $today = Carbon::now()->startOfDay();

        $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
            'start_date' => $this->cycle->start_date->format('Y-m-d'),
            'end_date' => $today->format('Y-m-d'),
        ])->assertOk();

        // Second attempt against the now-closed cycle id -> 409
        $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
            'start_date' => $this->cycle->start_date->format('Y-m-d'),
            'end_date' => $today->format('Y-m-d'),
        ])->assertStatus(409);

        // The new open cycle must still be intact (not closed by the second call)
        $this->assertSame(1, BillingCycle::where('status', 'open')->count());
    }

    public function test_invalid_range_is_rejected(): void
    {
        $today = Carbon::now()->startOfDay();

        $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
            'start_date' => $today->format('Y-m-d'),
            'end_date' => $today->copy()->subDays(1)->format('Y-m-d'),
        ])->assertStatus(422);

        // Cycle still open, nothing changed
        $this->assertSame('open', $this->cycle->fresh()->status);
    }

    public function test_close_without_cycle_id_is_rejected(): void
    {
        $today = Carbon::now()->startOfDay();

        // cycle_id is required so a stale/concurrent close can never target the
        // wrong (freshly created) cycle.
        $this->postJson('/api/billing-cycle/close', [
            'start_date' => $this->cycle->start_date->format('Y-m-d'),
            'end_date' => $today->format('Y-m-d'),
        ])->assertStatus(422);

        $this->assertSame('open', $this->cycle->fresh()->status);
    }

    public function test_close_without_dates_is_rejected_and_never_uses_system_date(): void
    {
        // A close request with no explicit dates must be rejected — the backend
        // must NEVER silently seal the cycle with the current/system date.
        $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
        ])->assertStatus(422);

        $fresh = $this->cycle->fresh();
        $this->assertSame('open', $fresh->status);
        $this->assertSame(
            $this->cycle->end_date->format('Y-m-d'),
            $fresh->end_date->format('Y-m-d')
        );
    }

    public function test_close_stores_exactly_the_selected_past_dates(): void
    {
        // The exact dates chosen in the UI must be stored verbatim — including
        // an end date in the past (not today), and a start date inside the
        // cycle rather than the cycle's own start.
        $start = Carbon::now()->startOfMonth()->addDays(4);
        $end = Carbon::now()->startOfMonth()->addDays(10);

        $response = $this->postJson('/api/billing-cycle/close', [
            'cycle_id' => $this->cycle->id,
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
        ]);

        $response->assertOk();

        $closed = $this->cycle->fresh();
        $this->assertSame('closed', $closed->status);
        $this->assertSame($start->format('Y-m-d'), $closed->start_date->format('Y-m-d'));
        $this->assertSame($end->format('Y-m-d'), $closed->end_date->format('Y-m-d'));
    }

    public function test_expense_creation_assigns_cycle_by_date(): void
    {
        $today = Carbon::now()->startOfDay();

        // The real creation path (ExpenseService) assigns the billing_cycle_id
        // from the expense's date.
        $service = app(\App\Services\ExpenseService::class);
        $expense = $service->create([
            'category_id' => null,
            'amount' => 100,
            'date' => $today->format('Y-m-d'),
            'description' => '',
        ]);

        // Assigned to the cycle whose range contains the date (the open one)
        $this->assertSame($this->cycle->id, $expense->fresh()->billing_cycle_id);
    }
}
