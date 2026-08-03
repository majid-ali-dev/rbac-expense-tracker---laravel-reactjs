<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $with = ['roles.permissions'];

    protected $fillable = ['name', 'email', 'password', 'phone', 'total_amount', 'status'];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'email_verified_at' => 'datetime',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ===== NEW: billing-cycle relationships =====
    public function dues()
    {
        return $this->hasMany(MemberDue::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function permissions(): array
    {
        return $this->roles->flatMap(fn($role) => $role->permissions)
            ->pluck('name')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function hasRole(string $role): bool
    {
        return $this->roleNames()->contains($role);
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return !empty(array_intersect($permissions, $this->permissions()));
    }

    public function roleNames(): Collection
    {
        return $this->roles->pluck('name')->filter()->unique()->values();
    }

    /**
     * ===== NEW: Cycle-scoped helpers =====
     * Use these instead of the old lifetime accessors below whenever you mean
     * "this member's CURRENT month bill", not their all-time history.
     *
     * Safe against N+1: if `dues`/`payments` are already eager-loaded
     * (filtered to the current cycle), it uses the collection in memory.
     * Otherwise it falls back to a scoped query for single-user use cases.
     */
    public function currentCycleAmount(int $billingCycleId): float
    {
        $due = $this->relationLoaded('dues')
            ? $this->dues->firstWhere('billing_cycle_id', $billingCycleId)
            : $this->dues()->where('billing_cycle_id', $billingCycleId)->first();

        // Fallback to the legacy total_amount column only if no due exists yet
        // (e.g. very first cycle before any rollover has run).
        return (float) ($due->amount_assigned ?? $this->total_amount ?? 0);
    }

    public function currentCyclePaid(int $billingCycleId): float
    {
        $payments = $this->relationLoaded('payments')
            ? $this->payments->where('billing_cycle_id', $billingCycleId)
            : $this->payments()->where('billing_cycle_id', $billingCycleId)->get();

        return (float) $payments->sum('paid_amount');
    }

    public function currentCycleRemaining(int $billingCycleId): float
    {
        return max(0, $this->currentCycleAmount($billingCycleId) - $this->currentCyclePaid($billingCycleId));
    }

    public function currentCycleStatus(int $billingCycleId): string
    {
        $amount = $this->currentCycleAmount($billingCycleId);
        $paid = $this->currentCyclePaid($billingCycleId);
        $remaining = max(0, $amount - $paid);

        if ($amount > 0 && $remaining <= 0) {
            return 'paid';
        }
        if ($paid > 0 && $remaining > 0) {
            return 'partial';
        }
        return 'unpaid';
    }

    // LEGACY: lifetime accessors (kept for reports/history — NOT for "current month" views)
    public function getTotalPaidAttribute()
    {
        if ($this->relationLoaded('payments')) {
            return (float) $this->payments->sum('paid_amount');
        }
        return (float) $this->payments()->sum('paid_amount');
    }

    public function getRemainingAttribute()
    {
        return max(0, (float) $this->total_amount - (float) $this->total_paid);
    }

    public function getPaymentStatusAttribute()
    {
        if ((float) $this->total_paid === 0.0) {
            return 'unpaid';
        }
        if ((float) $this->total_paid < (float) $this->total_amount) {
            return 'partial';
        }
        return 'paid';
    }

    /**
     * Reset user status for new billing cycle
     * Sets status to unpaid and resets cycle-specific data
     */
    public function resetForNewCycle(): void
    {
        $this->update([
            'status' => 'unpaid',
        ]);
    }
}
