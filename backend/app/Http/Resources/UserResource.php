<?php

namespace App\Http\Resources;

use App\Models\BillingCycle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get current billing cycle
        $cycle = BillingCycle::current();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,

            // Cycle-specific data (current month)
            'total_amount' => (float) $this->currentCycleAmount($cycle->id),
            'total_paid' => (float) $this->currentCyclePaid($cycle->id),
            'remaining' => (float) $this->currentCycleRemaining($cycle->id),
            'payment_status' => $this->currentCycleStatus($cycle->id),

            // Relationships
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permissions' => $this->permissions(),
            'role_names' => $this->roles->pluck('name'),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),

            // User info
            'joined_at' => $this->created_at?->format('d M Y'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
