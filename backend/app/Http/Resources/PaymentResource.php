<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'paid_amount' => (float) $this->paid_amount,
            'month' => $this->month,
            'month_label' => ucfirst($this->month),
            'updated_by' => $this->updated_by,
            'updater' => new UserResource($this->whenLoaded('updater')),
            'created_at' => $this->created_at?->toISOString(),
            'created_at_formatted' => $this->created_at?->format('d-m-Y h:i A'),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
