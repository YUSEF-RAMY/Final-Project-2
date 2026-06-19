<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Body_report extends Model
{
    protected $fillable = [
        'user_id', 'report_image', 'height', 'age', 'gender',
        'datetime', 'weight', 'smm', 'body_fat_mass',
        'water', 'protein', 'minerals', 'bmi', 'bmr', 'pbf', 'measured_at',
        'visceral_fat_level', 'waist_hip_ratio', 'trunk_fat_mass', 
        'trunk_lean_mass', 'inbody_score', 'lbm', 'tdee', 
        'calories', 'target_protein', 'target_carbs', 'target_fats'
    ];

    protected $casts = [
        'datetime' => 'datetime',
        'measured_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
