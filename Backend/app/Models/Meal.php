<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meal extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mealFoods(): HasMany
    {
        return $this->hasMany(MealFood::class);
    }

    public function foods()
    {
        return $this->belongsToMany(Food::class, 'meal_foods')
            ->withPivot(['quantity', 'calories', 'protein', 'carbs', 'fat'])
            ->withTimestamps();
    }
}
