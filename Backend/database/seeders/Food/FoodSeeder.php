<?php

namespace Database\Seeders\Food;

use App\Models\Food;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Food::create([
            'name' => 'Chicken Breast',
            'calories' => 165,
            'protein' => 31,
            'carbs' => 0,
            'fat' => 3,
            'category' => 'protein',
        ]);

        Food::create([
            'name' => 'Rice',
            'calories' => 130,
            'protein' => 2,
            'carbs' => 28,
            'fat' => 0,
            'category' => 'carb',
        ]);
    }
}
