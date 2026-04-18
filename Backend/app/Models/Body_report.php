<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Body_report extends Model
{
    protected $fillable = [
        'user_id', 'report_image', 'height', 'age', 'gender', 
        'datetime', 'weight', 'smm', 'body_fat_mass', 
        'water', 'protein', 'minerals', 'bmi', 'pbf', 'measured_at'
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
