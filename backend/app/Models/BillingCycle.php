<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BillingCycle extends Model
{
    protected $fillable = ['label', 'start_date', 'end_date', 'status', 'closed_at', 'closed_by', 'total_expense', 'total_paid'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'closed_at' => 'datetime',
        'total_expense' => 'decimal:2', 
        'total_paid' => 'decimal:2',
    ];

    public function dues()
    {
        return $this->hasMany(MemberDue::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get current open cycle
     */
    public static function current(): self
    {
        $open = static::where('status', 'open')->latest('start_date')->first();

        if ($open) {
            return $open;
        }

        // Create first cycle with FLEXIBLE dates
        $now = now();

        return static::create([
            'label' => $now->format('F Y'),
            'start_date' => $now->copy()->startOfDay(), // Can be any date
            'end_date' => $now->copy()->endOfMonth(), // Default to month end, but can be changed
            'status' => 'open',
               'total_expense' => 0,
            'total_paid' => 0,
        ]);
    }

    /**
     * Check if cycle is complete (can be closed)
     */
    public function canBeClosed(): bool
    {
        // Check if all members have paid
        // OR if admin manually decides to close
        return $this->status === 'open';
    }
}
