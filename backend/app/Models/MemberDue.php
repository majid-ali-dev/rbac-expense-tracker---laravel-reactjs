<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberDue extends Model
{
    protected $fillable = ['user_id', 'billing_cycle_id', 'amount_assigned', 'amount_paid'];

    protected $casts = [
        'amount_assigned' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function billingCycle()
    {
        return $this->belongsTo(BillingCycle::class);
    }
}
