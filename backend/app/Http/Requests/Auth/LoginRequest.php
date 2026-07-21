<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email field is required.',
            'email.email' => 'Email must be a valid email address.',
            'password.required' => 'Password field is required.',
            'password.string' => 'Password must be a valid text value.',
        ];
    }
}
