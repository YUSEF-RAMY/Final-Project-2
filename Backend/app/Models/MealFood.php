<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealFood extends Model
{
    protected $table = 'meal_foods';

    protected $fillable = [
        'meal_id',
        'food_id',
        'quantity',
        'calories',
        'protein',
        'carbs',
        'fat',
    ];

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class);
    }

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }
}
