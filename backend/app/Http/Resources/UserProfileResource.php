<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'id' => $this['user']->id,
                'name' => $this['user']->name,
                'email' => $this['user']->email,
                'phone' => $this['user']->phone ?? 'N/A',
                'total_amount' => (float) $this['user']->total_amount,
                'total_paid' => (float) $this['total_paid'],
                'remaining' => (float) $this['remaining'],
                'payment_status' => $this['user']->payment_status,
                'roles' => $this['user']->roles->pluck('name'),
                'joined_at' => $this['user']->created_at ? $this['user']->created_at->format('d M Y') : 'N/A',
                'created_at' => $this['user']->created_at,
            ],
            'payment_history' => $this['payment_history'],
        ];
    }
}