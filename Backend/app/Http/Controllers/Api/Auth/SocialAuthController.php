<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Auth\HandleSocialLoginAction;
use App\Contracts\Auth\SocialProviderFactoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class SocialAuthController extends Controller
{
    public function __construct(
        private readonly SocialProviderFactoryInterface $providerFactory,
        private readonly HandleSocialLoginAction $handleSocialLoginAction
    ) {}

    /**
     * Get the redirect URL for the given provider.
     */
    public function redirect(string $provider): JsonResponse
    {
        try {
            $handler = $this->providerFactory->make($provider);

            return response()->json([
                'url' => $handler->getRedirectUrl(),
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => 'Unsupported provider.',
            ], Response::HTTP_BAD_REQUEST);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'An error occurred while generating the redirect URL.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Handle the callback from the given provider.
     */
    public function callback(string $provider): JsonResponse
    {
        try {
            $handler = $this->providerFactory->make($provider);

            // This retrieves the standardized DTO
            $socialUserDTO = $handler->getUser();

            // Handle the login/registration business logic
            $result = $this->handleSocialLoginAction->execute($socialUserDTO);

            return response()->json([
                'message' => 'Successfully authenticated.',
                'status_code' => Response::HTTP_OK,
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ], Response::HTTP_OK);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => 'Unsupported provider.',
            ], Response::HTTP_BAD_REQUEST);
        } catch (Throwable $e) {
            // Depending on the environment, you might want to log $e->getMessage()
            return response()->json([
                'error' => 'An error occurred during authentication.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
