<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'category_id', 'title', 'amount', 'description', 'date', 'updated_by'];

    protected $casts = [
        'date' => 'date',
    ];

    // relationships
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
}
