<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // Per-cycle stats (only present when the index query aggregates them)
            'expense_count' => isset($this->expense_count) ? (int) $this->expense_count : null,
            'total_expense' => isset($this->total_expense) ? (float) $this->total_expense : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
