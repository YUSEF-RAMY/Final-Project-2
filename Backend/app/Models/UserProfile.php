<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id', 'age', 'height', 'weight', 'gender',
        'activity_level', 'primary_objective', 'medical_conditions'
    ];
}
