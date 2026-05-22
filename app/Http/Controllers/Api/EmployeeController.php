<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    /**
     * Employee login endpoint
     * Returns: { success, token, employee: { id, name, email, role } }
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            // Find employee by email
            $user = Employee::where('email', $validated['email'])->first();

            // Verify password
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Revoke any existing tokens for single session enforcement
            try {
                $user->tokens()->delete();
            } catch (\Exception $e) {
                \Log::warning('Failed to revoke existing tokens', [
                    'user_id' => $user->id,
                    
                    'error' => $e->getMessage()
                ]);
            }

            // Create new API token
            $token = $user->createToken(
                'employee-api-token',
                ['api', 'sessions', 'screenshots', 'activities'],
                now()->addDays(30)
            )->plainTextToken;

            // Get employee role (plain string on Employee model)
            $role = $user->role ?? 'employee';

            // Log login event
            \Log::info('Employee login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'token' => $token,
                'employee' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role
                ]
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Employee login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Login failed'
            ], 500);
        }
    }
}
