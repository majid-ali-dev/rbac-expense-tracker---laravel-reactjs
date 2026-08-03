<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['user_id', 'billing_cycle_id', 'paid_amount', 'month', 'updated_by'];

    protected $casts = ['paid_amount' => 'decimal:2'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function billingCycle()
    {
        return $this->belongsTo(BillingCycle::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}