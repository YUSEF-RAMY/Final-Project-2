<?php

namespace App\Repositories\Inbody;

use App\Models\Body_report;

class InBodyRepository
{
    public function store(array $data): Body_report
    {
        return Body_report::create($data);
    }
}