<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDevice extends Model
{
    protected $fillable = ['user_id', 'fcm_token', 'device_type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
