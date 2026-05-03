<?php

namespace App\Http\Controllers\Api\Food;

use App\Actions\Plan\GenerateNutritionPlanAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NutritionController extends Controller
{
    public function __construct(
        private GenerateNutritionPlanAction $action
    ) {}

    public function generate(Request $request)
    {
        return $this->action->execute($request->all());
    }
}
