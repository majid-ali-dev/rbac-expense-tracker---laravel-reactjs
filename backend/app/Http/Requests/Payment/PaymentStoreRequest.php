<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('payments.create');
    }

    public function rules(): array
    {
        return [
            'paid_amount' => ['required', 'numeric', 'gt:0'],
            // Explicitly selected billing cycle (e.g. an old/closed cycle the
            // user is currently viewing). When present, the payment is recorded
            // into that cycle instead of the current open one.
            'cycle_id' => ['nullable', 'integer', 'exists:billing_cycles,id'],
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
