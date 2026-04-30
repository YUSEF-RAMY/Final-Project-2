<?php

namespace App\Actions\Inbody;

use App\Models\UserProfile;
use Illuminate\Support\Facades\Auth;

class UpdateUserInBodyProfileAction
{
    public function execute($data)
    {
        return UserProfile::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'age' => $data['age'],
                'height' => $data['height'],
                'weight' => $data['weight'],
                'gender' => $data['gender'],
                'activity_level' => $data['activity_level'],
                'primary_objective' => $data['primary_objective'],
                'medical_conditions' => $data['medical_conditions'] ?? null,
            ]
        );
    }
}
