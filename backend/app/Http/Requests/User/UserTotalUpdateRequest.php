<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UserTotalUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('manage-users');
    }

    public function rules(): array
    {
        return [
            'total_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'total_amount.required' => 'Total amount is required.',
            'total_amount.numeric' => 'Total amount must be a number.',
            'total_amount.min' => 'Total amount must be at least 0.',
        ];
    }
}