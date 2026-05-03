<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    protected $fillable = [
        'name',
        'calories',
        'protein',
        'carbs',
        'fat',
        'category'
    ];
}
