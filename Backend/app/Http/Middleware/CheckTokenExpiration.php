<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next)
    {
        // 0. إذا كان المستخدم مصدقاً عليه بالفعل (مثل حالات actingAs في الاختبارات)
        if ($request->user()) {
            return $next($request);
        }

        // 1. الحصول على الـ Token من الـ Header
        $tokenString = $request->bearerToken();

        // 2. التحقق من وجود التوكن
        if (empty($tokenString)) {
            return response()->json([
                'message' => 'Token missing',
                'code' => 'TOKEN_MISSING',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 3. البحث عن التوكن في قاعدة البيانات
        $accessToken = PersonalAccessToken::findToken($tokenString);

        // 4. التحقق من صلاحية التوكن (هل هو مسجل لدينا في قاعدة البيانات؟)
        if (! $accessToken) {
            return response()->json([
                'status' => 'failed',
                'code' => 401,
                'message' => 'Token Expired , Please login again',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 5. التحقق من انتهاء صلاحية التوكن
        $expirationMinutes = config('sanctum.expiration');

        if ($expirationMinutes) {
            $expiresAt = Carbon::parse($accessToken->created_at)->addMinutes($expirationMinutes);

            if (now()->greaterThan($expiresAt)) {
                // حذف التوكن المنتهي من قاعدة البيانات تلقائياً لمنع أي محاولة وصول مستقبلاً
                $accessToken->delete();

                return response()->json([
                    'status' => 'failed',
                    'code' => 401,
                    'message' => 'Token Expired , Please login again',
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        return $next($request);
    }
}
