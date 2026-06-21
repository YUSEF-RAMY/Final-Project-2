<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BodyClassification extends Model
{
    protected $fillable = [
        'body_report_id',
        'category',
        'reasoning',
        'disease_condition',
        'metrics',
    ];

    protected $casts = [
        'metrics' => 'array',
    ];

    public function bodyReport()
    {
        return $this->belongsTo(Body_report::class);
    }
}
