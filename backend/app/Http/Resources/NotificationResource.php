<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\NotificationReadResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = auth()->user();
        $isRead = $this->isReadByUser($user->id);

        // Get total members count
        $totalMembers = User::whereHas('roles', fn($q) => $q->where('name', 'member'))->count();
        $readCount = $this->reads()->count();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'is_active' => $this->is_active,
            'is_read' => $isRead,
            'read_at' => $this->when($isRead, function() use ($user) {
                return $this->reads()->where('user_id', $user->id)->first()?->read_at;
            }),
            'read_count' => $readCount,           
            'total_members' => $totalMembers,     
            'reads' => NotificationReadResource::collection($this->whenLoaded('reads')),
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}