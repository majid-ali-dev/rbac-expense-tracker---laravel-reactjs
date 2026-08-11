<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class NotificationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasPermission('notifications.create');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Title is required.',
            'title.string' => 'Title must be a valid text.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'content.required' => 'Content is required.',
            'content.string' => 'Content must be a valid text.',
            'content.max' => 'Content may not be greater than 1000 characters.',
        ];
    }
}
