<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use App\Models\Expense;

class Category extends Model
{
    use HasFactory;
    
    protected $fillable = ['name'];

    // Relationship with Expense
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
