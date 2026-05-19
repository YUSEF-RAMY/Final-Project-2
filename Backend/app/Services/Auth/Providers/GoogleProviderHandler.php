<?php

namespace App\Services\Auth\Providers;

use App\Contracts\Auth\SocialProviderHandlerInterface;
use App\DTOs\Auth\SocialUserDTO;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use RuntimeException;

class GoogleProviderHandler implements SocialProviderHandlerInterface
{
    public const PROVIDER_NAME = 'google';

    /**
     * Step 1: Generate the Google OAuth 2.0 Authorization Request URL.
     */
    public function getRedirectUrl(): string
    {
        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ]);

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.$query;
    }

    /**
     * Step 2 & 3: Handle Callback, exchange code for Token, and fetch User Info.
     */
    public function getUser(): SocialUserDTO
    {
        $code = request()->query('code');

        if (! $code) {
            throw new InvalidArgumentException('Authorization code is missing from the callback request.');
        }

        // Step 2: Swap the authorization code for an access token via Google token endpoint
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'code' => $code,
            'grant_type' => 'authorization_code',
        ]);

        if ($tokenResponse->failed()) {
            throw new RuntimeException('Failed to exchange authorization code for access token: '.$tokenResponse->body());
        }

        $tokens = $tokenResponse->json();
        $accessToken = $tokens['access_token'];

        // Step 3: Fetch user profile data from Google API using the access token
        $userResponse = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if ($userResponse->failed()) {
            throw new RuntimeException('Failed to retrieve user profile data from Google: '.$userResponse->body());
        }

        $googleUser = $userResponse->json();

        // Step 4: Map the retrieved data into our standardized SocialUserDTO
        return new SocialUserDTO(
            providerName: self::PROVIDER_NAME,
            providerId: $googleUser['sub'],
            email: $googleUser['email'],
            name: $googleUser['name'],
            phone: null, // Google doesn't return phone numbers by default
            avatar: $googleUser['picture'] ?? null,
            token: $accessToken,
        );
    }
}
