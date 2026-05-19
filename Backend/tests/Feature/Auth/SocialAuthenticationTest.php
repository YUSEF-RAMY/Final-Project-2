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

test('facebook redirect returns a valid redirect url', function () {
    $mockUrl = 'https://www.facebook.com/v3.3/dialog/oauth?client_id=1667161467666707';

    Socialite::shouldReceive('driver')
        ->with('facebook')
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('stateless')
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('scopes')
        ->with(['email'])
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('redirect')
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('getTargetUrl')
        ->once()
        ->andReturn($mockUrl);

    $response = $this->getJson('/api/auth/facebook/redirect');

    $response->assertOk()
        ->assertJson(['url' => $mockUrl]);
});

test('facebook callback handles login and registration correctly', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('facebook-123');
    $socialiteUser->shouldReceive('getEmail')->andReturn('fb-test@example.com');
    $socialiteUser->shouldReceive('getName')->andReturn('FB Test User');
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/fb-avatar.jpg');
    $socialiteUser->token = 'mock-facebook-token';

    Socialite::shouldReceive('driver')
        ->with('facebook')
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('stateless')
        ->once()
        ->andReturnSelf();

    Socialite::shouldReceive('user')
        ->once()
        ->andReturn($socialiteUser);

    $response = $this->getJson('/api/auth/facebook/callback?code=valid-auth-code');

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
        'email' => 'fb-test@example.com',
        'name' => 'FB Test User',
    ]);
});

test('facebook callback handles cancellation/errors gracefully', function () {
    $response = $this->getJson('/api/auth/facebook/callback?error=access_denied&error_code=200&error_description=Permissions+error');

    $response->assertStatus(500)
        ->assertJsonFragment([
            'error' => 'An error occurred during authentication.',
        ]);
});
