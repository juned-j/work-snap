<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class ApiAuthController extends Controller
{
    /**
     * Register a new user with token generation
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'employee' // Default role
            ]);

            // Generate secure API token with timestamp and IP tracking
            $token = $user->createToken(
                'electron-app-token',
                ['api', 'sessions', 'screenshots', 'activities'],
                now()->addDays(30)
            );

            return response()->json([
                'message' => 'Registration successful',
                'user' => $this->formatUserResponse($user),
                'token' => $token->plainTextToken,
                'expires_in' => 86400 * 30 // 30 days
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => 'An error occurred during registration'
            ], 500);
        }
    }

    /**
     * Login user and return token
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'email' => 'The provided credentials are incorrect.'
                ]);
            }

            // Revoke any existing tokens for this user (force single session)
            $user->tokens()->delete();

            // Generate new secure token
            $token = $user->createToken(
                'electron-app-token',
                ['api', 'sessions', 'screenshots', 'activities'],
                now()->addDays(30)
            );

            // Log login attempt for audit
            \Log::info('User login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 100)
            ]);

            return response()->json([
                'message' => 'Login successful',
                'user' => $this->formatUserResponse($user),
                'token' => $token->plainTextToken,
                'expires_in' => 86400 * 30 // 30 days
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Login failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Not authenticated'
                ], 401);
            }

            // Revoke the current token
            $user->currentAccessToken()->delete();

            // Log logout
            \Log::info('User logout', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Logout successful'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Logout failed',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Format user response to prevent leaking sensitive data
     */
    private function formatUserResponse(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'email_verified_at' => $user->email_verified_at
        ];
    }
}
