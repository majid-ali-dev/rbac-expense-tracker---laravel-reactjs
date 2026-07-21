<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Collection;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $with = ['roles.permissions'];

    protected $fillable = ['name','email','password','phone','total_amount','status'];

    protected $casts = ['total_amount' => 'decimal:2'];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function permissions(): Collection
    {
        return $this->roles->flatMap(fn ($role) 
        => $role->permissions)->pluck('name')->filter()->unique()->values();
    }


    public function hasRole(string $role): bool
    {
        return $this->roleNames()->contains($role);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return $this->permissions()->intersect($permissions)->isNotEmpty();
    }

    public function roleNames(): Collection
    {
        return $this->roles->pluck('name')->filter()->unique()->values();
    }

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
}
