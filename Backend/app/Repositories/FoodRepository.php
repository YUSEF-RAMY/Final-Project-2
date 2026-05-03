<?php

namespace App\Repositories;

use App\Models\Food;

class FoodRepository
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getProteinFoods()
    {
        return Food::where('category','protein')->get();
    }

    public function getCarbFoods()
    {
        return Food::where('category','carb')->get();
    }

    public function getFatFoods()
    {
        return Food::where('category','fat')->get();
    }
}
