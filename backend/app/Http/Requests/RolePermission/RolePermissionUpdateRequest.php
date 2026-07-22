<?php

namespace App\Http\Requests\RolePermission;

use Illuminate\Foundation\Http\FormRequest;

class RolePermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('assign-roles');
    }

    public function rules(): array
    {
        return [
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.array' => 'Permissions selection is invalid.',
            'permissions.*.integer' => 'Each selected permission must be valid.',
            'permissions.*.exists' => 'One or more selected permissions are invalid.',
        ];
    }
}
