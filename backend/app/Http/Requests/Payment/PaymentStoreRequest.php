<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('create-payment');
    }

    public function rules(): array
    {
        return [
            'paid_amount' => ['required', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'paid_amount.required' => 'Payment amount is required.',
            'paid_amount.numeric' => 'Payment amount must be a number.',
            'paid_amount.gt' => 'Payment amount must be greater than 0.',
        ];
    }
}
