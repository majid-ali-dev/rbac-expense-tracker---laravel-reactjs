<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:5'],
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
            'password.required' => 'Password field is required.',
            'password.string' => 'Password must be a valid text value.',
            'password.min' => 'Password must be at least 5 characters.',
        ];
    }
}
