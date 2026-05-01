<?php

namespace App\Enums;

enum PrimaryObjective: string
{
    case LOSE_WEIGHT = 'lose_weight';
    case MAINTAIN = 'maintain';
    case GAIN_WEIGHT = 'gain_weight';
    case BUILD_MUSCLE = 'build_muscle';

    public function getCalorieAdjustment(): int
    {
        return match ($this) {
            self::LOSE_WEIGHT => -500,
            self::MAINTAIN => 0,
            self::GAIN_WEIGHT, self::BUILD_MUSCLE => 500,
        };
    }
}
