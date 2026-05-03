<?php

namespace App\Http\Requests\Api\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class RegisterDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fcm_token' => 'required|string',
            'device_type' => 'required|in:android,ios,web',
        ];
    }
}
