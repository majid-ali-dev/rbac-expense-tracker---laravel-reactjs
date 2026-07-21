<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;


class AuthResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this['user']),
            'token' => $this['token'],
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.expiration') * 60,
        ];
    }
}
