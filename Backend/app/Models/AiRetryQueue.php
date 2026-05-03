<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiRetryQueue extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payload',
        'trace_id',
        'status',
        'attempts_count',
        'last_attempt_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'last_attempt_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
