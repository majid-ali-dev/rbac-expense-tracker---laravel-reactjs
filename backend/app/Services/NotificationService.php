<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationRead;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    public function getAll()
    {
        return Notification::with(['creator', 'reads.user'])
            ->latest()
            ->get();
    }

    public function findById(int $id): ?Notification
    {
        return Notification::with(['creator', 'reads.user'])->find($id);
    }

    public function create(array $data): Notification
    {
        $data['created_by'] = Auth::id();
        return Notification::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        // Reset all reads when notification is updated
        // This ensures members see the updated version
        $notification->reads()->delete();

        return $notification->update($data);
    }

    public function delete(int $id): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        // Delete all reads first
        $notification->reads()->delete();

        return $notification->delete();
    }

    public function markAsRead(int $notificationId): bool
    {
        $user = Auth::user();
        $notification = $this->findById($notificationId);

        if (!$notification || !$notification->is_active) {
            return false;
        }

        $read = NotificationRead::firstOrCreate([
            'notification_id' => $notificationId,
            'user_id' => $user->id,
        ]);

        if ($read->wasRecentlyCreated) {
            $read->update(['read_at' => now()]);
            return true;
        }

        return false;
    }

    public function getUnreadCount(): int
    {
        $user = Auth::user();
        return Notification::where('is_active', true)
            ->whereDoesntHave('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->count();
    }

    public function getUnreadForUser(): array
    {
        $user = Auth::user();
        return Notification::with(['creator', 'reads'])
            ->where('is_active', true)
            ->whereDoesntHave('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->latest()
            ->get()
            ->toArray();
    }

    public function getReadForUser(): array
    {
        $user = Auth::user();
        return Notification::with(['creator', 'reads'])
            ->where('is_active', true)
            ->whereHas('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->latest()
            ->get()
            ->toArray();
    }
}
