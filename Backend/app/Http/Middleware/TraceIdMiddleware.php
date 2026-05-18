<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TraceIdMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if trace_id already exists in headers (for incoming distributed tracing)
        $traceId = $request->header('X-Trace-Id') ?: (string) Str::uuid();

        // Bind the trace_id to the service container for global access
        app()->instance('trace_id', $traceId);

        $response = $next($request);

        // Attach trace_id to the response headers for client tracking
        $response->headers->set('X-Trace-Id', $traceId);

        return $response;
    }
}
