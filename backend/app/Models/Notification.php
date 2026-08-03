<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['title', 'content', 'is_active', 'created_by'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reads()
    {
        return $this->hasMany(NotificationRead::class);
    }

    public function getReadCountAttribute()
    {
        return $this->reads()->count();
    }

    public function getUnreadCountAttribute()
    {
        $totalMembers = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->count();
        return $totalMembers - $this->reads()->count();
    }

    public function isReadByUser(int $userId): bool
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
