<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationReadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'read_at' => $this->read_at?->toISOString(),
            'read_at_formatted' => $this->read_at?->format('d M Y, h:i A'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
