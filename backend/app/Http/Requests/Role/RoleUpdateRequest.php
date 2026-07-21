<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('assign-roles');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($this->role)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name field is required.',
            'name.string' => 'Role name must be a valid text value.',
            'name.max' => 'Role name may not be greater than 255 characters.',
            'name.unique' => 'This role already exists.',
        ];
    }
}
