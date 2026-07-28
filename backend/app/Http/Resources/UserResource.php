<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'total_amount' => (float) $this->total_amount,
            'total_paid' => (float) $this->total_paid,
            'remaining' => (float) $this->remaining,
            'payment_status' => $this->payment_status,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permissions' => $this->permissions(),
            'role_names' => $this->roles->pluck('name'),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'joined_at' => $this->created_at?->format('d M Y'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
