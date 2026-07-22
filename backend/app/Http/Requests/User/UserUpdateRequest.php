<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('manage-users');
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['required', 'string', 'max:255'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name field is required.',
            'name.string' => 'Name must be a valid text value.',
            'name.max' => 'Name may not be greater than 255 characters.',
            'email.required' => 'Email field is required.',
            'email.email' => 'Email must be a valid email address.',
            'email.max' => 'Email may not be greater than 255 characters.',
            'email.unique' => 'This email address is already registered.',
            'phone.required' => 'Phone field is required.',
            'phone.string' => 'Phone must be a valid text value.',
            'phone.max' => 'Phone may not be greater than 255 characters.',
            'total_amount.numeric' => 'Total amount must be a number.',
            'total_amount.min' => 'Total amount must be at least 0.',
            'roles.array' => 'Roles selection is invalid.',
            'roles.*.integer' => 'Each selected role must be valid.',
            'roles.*.exists' => 'One or more selected roles are invalid.',
        ];
    }
}
