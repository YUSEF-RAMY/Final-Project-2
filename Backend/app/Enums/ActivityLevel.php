<?php

namespace App\Enums;

enum ActivityLevel: string
{
    case SEDENTARY = 'sedentary';
    case LIGHTLY_ACTIVE = 'lightly_active';
    case MODERATELY_ACTIVE = 'moderately_active';
    case VERY_ACTIVE = 'very_active';
    case EXTRA_ACTIVE = 'extra_active';

    public function getMultiplier(): float
    {
        return match ($this) {
            self::SEDENTARY => 1.2,
            self::LIGHTLY_ACTIVE => 1.375,
            self::MODERATELY_ACTIVE => 1.55,
            self::VERY_ACTIVE => 1.725,
            self::EXTRA_ACTIVE => 1.9,
        };
    }
}
