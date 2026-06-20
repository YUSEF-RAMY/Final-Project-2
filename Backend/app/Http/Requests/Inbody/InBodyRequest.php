<?php

namespace App\Http\Requests\Inbody;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InBodyRequest extends FormRequest
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
            'image' => 'required|mimes:jpeg,png,jpg|max:5120',
            'goal' => 'required|string|in:lose_fat,maintain,gain_muscle',
            'activity_level' => 'required|integer|between:1,5',
            'fitness_level' => 'nullable|integer|between:1,5',
            'disease_condition' => 'nullable|string',
        ];
    }
}
