<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseHistory extends Model
{
    protected $fillable = [
        'expense_id',
        'user_id',
        'action',
        'old_data',
        'new_data',
        'changed_fields',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
