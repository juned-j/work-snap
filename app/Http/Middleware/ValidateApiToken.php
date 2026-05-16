<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ValidateApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'message' => 'Unauthorized - Missing authentication token',
                'status' => 'error'
            ], 401);
        }

        // Validate token against stored tokens (can be JWT or API token)
        // For now, using simple Bearer token validation
        if (!$this->validateToken($token, $request)) {
            return response()->json([
                'message' => 'Unauthorized - Invalid or expired token',
                'status' => 'error'
            ], 401);
        }

        // Set request user from token
        $user = $this->getUserFromToken($token);
        if ($user) {
            Auth::setUser($user);
            $request->setUserResolver(fn() => $user);
        }

        return $next($request);
    }

    /**
     * Extract Bearer token from Authorization header
     */
    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return null;
        }

        return substr($header, 7);
    }

    /**
     * Validate token against database or cache
     */
    private function validateToken(string $token, Request $request): bool
    {
        // Validate token format and expiration
        // This checks against personal_access_tokens table if using Laravel Sanctum
        
        try {
            // Check if token exists and is not revoked
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

            if (!$personalAccessToken) {
                return false;
            }

            // Optionally check token expiration
            if ($personalAccessToken->expires_at && now()->isAfter($personalAccessToken->expires_at)) {
                return false;
            }

            // Verify token abilities if needed (add security scopes)
            $abilities = $personalAccessToken->abilities ?? [];
            if (!in_array('*', $abilities) && !in_array('api', $abilities)) {
                // Token doesn't have API access ability
                return false;
            }

            // Additional security: Check IP address if configured
            if (config('app.enforce_token_ip_check')) {
                $storedIp = $personalAccessToken->ip_address ?? null;
                if ($storedIp && $storedIp !== $request->ip()) {
                    \Log::warning('Token IP mismatch', [
                        'token_id' => $personalAccessToken->id,
                        'expected_ip' => $storedIp,
                        'actual_ip' => $request->ip()
                    ]);
                    return false;
                }
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Token validation error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user from token
     */
    private function getUserFromToken(string $token): ?\App\Models\User
    {
        try {
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

            if (!$personalAccessToken) {
                return null;
            }

            return $personalAccessToken->tokenable;
        } catch (\Exception $e) {
            return null;
        }
    }
}
