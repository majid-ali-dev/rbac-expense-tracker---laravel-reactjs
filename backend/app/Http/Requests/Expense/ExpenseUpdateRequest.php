<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExpenseUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('edit-expense');
    }

    public function rules(): array
    {
        $expenseId = $this->route('id');

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('expenses', 'title')->ignore($expenseId)->where(function ($query) {
                    return $query->where('user_id', auth()->id())
                        ->whereDate('date', $this->input('date'));
                }),
            ],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Title field is required.',
            'title.string' => 'Title must be a valid text value.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'title.unique' => 'An expense with this title already exists for the selected date.',
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
