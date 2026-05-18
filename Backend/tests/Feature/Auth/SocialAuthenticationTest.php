<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('google redirect returns a valid redirect url', function () {
    $response = $this->getJson('/api/auth/google/redirect');

    $response->assertOk()
        ->assertJsonStructure(['url']);

    $url = $response->json('url');
    expect($url)->toContain('https://accounts.google.com/o/oauth2/v2/auth')
        ->toContain('client_id=')
        ->toContain('response_type=code')
        ->toContain('scope=openid+email+profile');
});

test('google callback handles login and registration correctly', function () {
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'mock-google-token',
            'expires_in' => 3600,
            'token_type' => 'Bearer',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-123',
            'email' => 'test@example.com',
            'name' => 'Test User',
            'picture' => 'https://example.com/avatar.jpg',
            'email_verified' => true,
        ], 200),
    ]);

    $response = $this->getJson('/api/auth/google/callback?code=valid-auth-code');

    $response->assertOk()
        ->assertJsonStructure([
            'message',
            'user' => [
                'id',
                'name',
                'email',
            ],
            'token',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);

    $user = User::where('email', 'test@example.com')->first();

    $this->assertDatabaseHas('linked_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'google',
        'provider_id' => 'google-123',
    ]);
});

test('subsequent login links existing account', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'mock-google-token',
            'expires_in' => 3600,
            'token_type' => 'Bearer',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-123',
            'email' => 'test@example.com',
            'name' => 'Test User',
            'picture' => 'https://example.com/avatar.jpg',
            'email_verified' => true,
        ], 200),
    ]);

    $response = $this->getJson('/api/auth/google/callback?code=valid-auth-code');

    $response->assertOk();

    $this->assertCount(1, User::all());
    $this->assertDatabaseHas('linked_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'google',
        'provider_id' => 'google-123',
    ]);
});

test('unsupported provider returns 400 bad request', function () {
    $response = $this->getJson('/api/auth/unsupported/redirect');
    $response->assertStatus(400)
        ->assertJson(['error' => 'Unsupported provider.']);
});
