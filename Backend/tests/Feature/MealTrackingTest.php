<?php

use App\Models\Food;
use App\Models\User;
use App\Models\UserTarget;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->food = Food::create([
        'name' => 'Chicken',
        'calories' => 100,
        'protein' => 20,
        'carbs' => 0,
        'fat' => 2,
        'serving_size' => '100g',
    ]);

    UserTarget::create([
        'user_id' => $this->user->id,
        'daily_calories' => 2000,
        'target_protein' => 150,
        'target_carbs' => 200,
        'target_fats' => 70,
    ]);
});

test('can add food multiple times and they remain separate rows but merged in API', function () {
    // Add first time
    $this->actingAs($this->user)
        ->postJson('/api/foods/meals/breakfast/items', [
            'food_id' => $this->food->id,
            'quantity' => 1,
        ]);

    // Add second time
    $this->actingAs($this->user)
        ->postJson('/api/foods/meals/breakfast/items', [
            'food_id' => $this->food->id,
            'quantity' => 2,
        ]);

    // Verify 2 separate rows in DB (Option A)
    $this->assertDatabaseCount('meal_foods', 2);

    // Verify merged in API summary
    $response = $this->actingAs($this->user)
        ->getJson('/api/foods/daily-summary');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data.meals.0.items') // Merged to 1 item
        ->assertJsonPath('data.meals.0.items.0.total_quantity', 3)
        ->assertJsonPath('data.meals.0.items.0.total_nutrition.calories', 300);
});

test('summary returns full macro distribution per meal', function () {
    $response = $this->actingAs($this->user)
        ->getJson('/api/foods/daily-summary');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'meal_targets' => [
                    'breakfast' => ['calories', 'protein', 'carbs', 'fat'],
                    'lunch', 'dinner', 'snacks',
                ],
            ],
        ]);
});

test('summary returns progress indicators and status', function () {
    // Add food to reach 10%
    $this->actingAs($this->user)
        ->postJson('/api/foods/meals/breakfast/items', [
            'food_id' => $this->food->id,
            'quantity' => 2, // 200 cal = 10% of 2000
        ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/foods/daily-summary');

    $response->assertStatus(200);

    $progress = $response->json('data.overview.progress.calories_percentage');
    expect((float) $progress)->toBe(10.0);
    $response->assertJsonPath('data.overview.status', 'under_target');
});

test('validates quantity is greater than zero', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/foods/meals/breakfast/items', [
            'food_id' => $this->food->id,
            'quantity' => 0,
        ]);

    $response->assertStatus(422);
});
