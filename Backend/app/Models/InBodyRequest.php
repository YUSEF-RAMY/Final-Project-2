<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InBodyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'trace_id',
        'image_path',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
