<?php

namespace App\Services\UserTarget;

class UserTargetService
{
    public function getUserDailyTarget($user)
    {
        return $user->target;
    }
}
