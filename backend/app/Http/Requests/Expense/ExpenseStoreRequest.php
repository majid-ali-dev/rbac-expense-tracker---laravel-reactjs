<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('create-expense');
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'amount.required' => 'Amount field is required.',
            'amount.numeric' => 'Amount must be a number.',
            'amount.min' => 'Amount must be at least 0.',
            'description.string' => 'Description must be a valid text value.',
            'description.max' => 'Description may not be greater than 1000 characters.',
            'date.required' => 'Date field is required.',
            'date.date' => 'Date must be a valid date.',
        ];
    }
}
