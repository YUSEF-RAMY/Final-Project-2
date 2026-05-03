<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealPlan extends Model
{
    protected $table = 'meal_plans';

    protected $fillable = [
        'user_id',
        'meal_type',
        'percentage',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
