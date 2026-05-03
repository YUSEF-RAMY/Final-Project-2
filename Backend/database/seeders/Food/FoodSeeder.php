<?php

namespace Database\Seeders\Food;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        $foods = [
            // Proteins
            ['name' => 'Chicken Breast', 'calories' => 165, 'protein' => 31, 'carbs' => 0, 'fat' => 3.6, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Beef Sirloin', 'calories' => 250, 'protein' => 26, 'carbs' => 0, 'fat' => 15, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Canned Tuna', 'calories' => 130, 'protein' => 28, 'carbs' => 0, 'fat' => 1, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Eggs (Large)', 'calories' => 70, 'protein' => 6, 'carbs' => 0.6, 'fat' => 5, 'serving_size' => '1 egg', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Salmon Fillet', 'calories' => 208, 'protein' => 20, 'carbs' => 0, 'fat' => 13, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Greek Yogurt', 'calories' => 59, 'protein' => 10, 'carbs' => 3.6, 'fat' => 0.4, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Turkey Breast', 'calories' => 135, 'protein' => 30, 'carbs' => 0, 'fat' => 1, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Lentils', 'calories' => 116, 'protein' => 9, 'carbs' => 20, 'fat' => 0.4, 'serving_size' => '100g', 'category' => 'Proteins', 'image' => 'https://images.unsplash.com/photo-1533243991054-94921359876f?auto=format&fit=crop&q=80&w=200'],

            // Carbs
            ['name' => 'White Rice', 'calories' => 130, 'protein' => 2.7, 'carbs' => 28, 'fat' => 0.3, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Pasta (Cooked)', 'calories' => 131, 'protein' => 5, 'carbs' => 25, 'fat' => 1.1, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Whole Wheat Bread', 'calories' => 247, 'protein' => 13, 'carbs' => 41, 'fat' => 3.4, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Oatmeal (Cooked)', 'calories' => 68, 'protein' => 2.4, 'carbs' => 12, 'fat' => 1.4, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Potato (Boiled)', 'calories' => 77, 'protein' => 2, 'carbs' => 17, 'fat' => 0.1, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Sweet Potato', 'calories' => 86, 'protein' => 1.6, 'carbs' => 20, 'fat' => 0.1, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Quinoa', 'calories' => 120, 'protein' => 4.4, 'carbs' => 21, 'fat' => 1.9, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Banana', 'calories' => 89, 'protein' => 1.1, 'carbs' => 23, 'fat' => 0.3, 'serving_size' => '100g', 'category' => 'Carbs', 'image' => 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=200'],

            // Fats
            ['name' => 'Olive Oil', 'calories' => 884, 'protein' => 0, 'carbs' => 0, 'fat' => 100, 'serving_size' => '100ml', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Butter', 'calories' => 717, 'protein' => 0.9, 'carbs' => 0.1, 'fat' => 81, 'serving_size' => '100g', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1589985273913-2213b168ccd7?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Almonds', 'calories' => 579, 'protein' => 21, 'carbs' => 22, 'fat' => 50, 'serving_size' => '100g', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Avocado', 'calories' => 160, 'protein' => 2, 'carbs' => 9, 'fat' => 15, 'serving_size' => '100g', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Walnuts', 'calories' => 654, 'protein' => 15, 'carbs' => 14, 'fat' => 65, 'serving_size' => '100g', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Peanut Butter', 'calories' => 588, 'protein' => 25, 'carbs' => 20, 'fat' => 50, 'serving_size' => '100g', 'category' => 'Fats', 'image' => 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=200'],

            // Mixed/Fast Food
            ['name' => 'Margherita Pizza', 'calories' => 250, 'protein' => 10, 'carbs' => 30, 'fat' => 10, 'serving_size' => '1 slice (100g)', 'category' => 'Mixed', 'image' => 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Beef Burger', 'calories' => 250, 'protein' => 13, 'carbs' => 20, 'fat' => 15, 'serving_size' => '100g', 'category' => 'Mixed', 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Chicken Shawarma', 'calories' => 180, 'protein' => 15, 'carbs' => 10, 'fat' => 8, 'serving_size' => '100g', 'category' => 'Mixed', 'image' => 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Sushi Roll (Salmon)', 'calories' => 150, 'protein' => 6, 'carbs' => 28, 'fat' => 2, 'serving_size' => '100g', 'category' => 'Mixed', 'image' => 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Caesar Salad', 'calories' => 150, 'protein' => 8, 'carbs' => 6, 'fat' => 10, 'serving_size' => '100g', 'category' => 'Mixed', 'image' => 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=200'],

            // Healthy/Fruits/Veg
            ['name' => 'Broccoli', 'calories' => 34, 'protein' => 2.8, 'carbs' => 7, 'fat' => 0.4, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Spinach', 'calories' => 23, 'protein' => 2.9, 'carbs' => 3.6, 'fat' => 0.4, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Apple', 'calories' => 52, 'protein' => 0.3, 'carbs' => 14, 'fat' => 0.2, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Blueberries', 'calories' => 57, 'protein' => 0.7, 'carbs' => 14, 'fat' => 0.3, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Carrots', 'calories' => 41, 'protein' => 0.9, 'carbs' => 10, 'fat' => 0.2, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Cucumber', 'calories' => 15, 'protein' => 0.7, 'carbs' => 3.6, 'fat' => 0.1, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1449339044511-d14cf19760e1?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Strawberry', 'calories' => 32, 'protein' => 0.7, 'carbs' => 7.7, 'fat' => 0.3, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Tomato', 'calories' => 18, 'protein' => 0.9, 'carbs' => 3.9, 'fat' => 0.2, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&q=80&w=200'],
            ['name' => 'Orange', 'calories' => 47, 'protein' => 0.9, 'carbs' => 12, 'fat' => 0.1, 'serving_size' => '100g', 'category' => 'Healthy', 'image' => 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=200'],
        ];

        foreach ($foods as $food) {
            Food::updateOrCreate(['name' => $food['name']], $food);
        }
    }
}
