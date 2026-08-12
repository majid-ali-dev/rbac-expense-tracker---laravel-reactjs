<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'category_id', 'billing_cycle_id', 'title', 'amount', 'description', 'date', 'updated_by'];

    protected $casts = [
        'date' => 'date',
    ];

    // relationships
    public function billingCycle()
    {
        return $this->belongsTo(BillingCycle::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function histories()
    {
        return $this->hasMany(ExpenseHistory::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Scope an expense query to a single billing cycle.
     *
     * Expenses are matched by their permanent billing_cycle_id. As a safety
     * net (e.g. records created before cycle attribution existed), expenses
     * without a cycle are matched by date: for an OPEN cycle the window ends
     * today (matching the rest of the app), for a CLOSED cycle it is the exact
     * [start, end] range that was sealed at close time.
     */
    public function scopeInCycle(Builder $query, BillingCycle $cycle): Builder
    {
        // For the OPEN cycle the date window ends today (matching the rest of
        // the app); for a CLOSED cycle it is the exact sealed range.
        $end = $cycle->status === 'open'
            ? Carbon::now()->format('Y-m-d')
            : $cycle->end_date->format('Y-m-d');

        return $query->where(function (Builder $q) use ($cycle, $end) {
            $q->where('billing_cycle_id', $cycle->id)
                ->orWhere(function (Builder $q2) use ($cycle, $end) {
                    $q2->whereNull('billing_cycle_id')
                        ->whereBetween('date', [
                            $cycle->start_date->format('Y-m-d'),
                            $end,
                        ]);
                });
        });
    }
}
