<?php

namespace App\Http\Requests\Inbody\Manual;

use App\Enums\ActivityLevel;
use App\Enums\PrimaryObjective;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreManualProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'age' => 'required|integer|min:10|max:100',
            'height' => 'required|numeric',
            'weight' => 'required|numeric',
            'gender' => 'required|in:male,female',
            'activity_level' => 'required',
            'goal' => 'required|string',
            'disease_condition' => 'nullable|string',
        ];
    }
}
