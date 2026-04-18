<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTarget extends Model
{
    protected $fillable = [
        'user_id',
        'daily_calories',
        'target_protein',
        'target_carbs',
        'target_fats',
        'fitness_goal'
    ];

    protected $casts = [
        'daily_calories' => 'float',
        'target_protein' => 'float',
        'target_carbs'   => 'float',
        'target_fats'    => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
