<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermissionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('assign-roles');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Permission name field is required.',
            'name.string' => 'Permission name must be a valid text value.',
            'name.max' => 'Permission name may not be greater than 255 characters.',
            'name.unique' => 'This permission already exists.',
        ];
    }
}
