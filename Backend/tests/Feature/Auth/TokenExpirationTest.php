<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

test('request without token returns token missing response', function () {
    $response = $this->getJson('/api/foods'); // Protected route

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Token missing',
            'code' => 'TOKEN_MISSING',
        ]);
});

test('request with invalid token returns invalid token response', function () {
    $response = $this->withHeaders([
        'Authorization' => 'Bearer invalid-token-format-or-not-in-db',
    ])->getJson('/api/foods');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Invalid token',
            'code' => 'INVALID_TOKEN',
        ]);
});

test('request with expired token deletes token and returns expired response', function () {
    $user = User::factory()->create();
    $tokenResult = $user->createToken('test_token');
    $plainTextToken = $tokenResult->plainTextToken;

    // Set expiration to 1 minute
    Config::set('sanctum.expiration', 1);

    // Retrieve the database token and modify created_at to be in the past (e.g. 5 minutes ago)
    $tokenModel = $tokenResult->accessToken;
    $tokenModel->created_at = now()->subMinutes(5);
    $tokenModel->save();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$plainTextToken,
    ])->getJson('/api/foods');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Token expired',
            'code' => 'TOKEN_EXPIRED',
        ]);

    // Check that the token was deleted from the database
    $this->assertDatabaseMissing('personal_access_tokens', [
        'id' => $tokenModel->id,
    ]);
});

test('request with valid token proceeds successfully', function () {
    $user = User::factory()->create();
    $tokenResult = $user->createToken('test_token');
    $plainTextToken = $tokenResult->plainTextToken;

    // Set expiration to 10 minutes
    Config::set('sanctum.expiration', 10);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$plainTextToken,
    ])->getJson('/api/foods');

    // The route should execute or pass auth:sanctum (we assert it is not 401 unauthenticated/missing/invalid/expired)
    $response->assertStatus(200);
});
