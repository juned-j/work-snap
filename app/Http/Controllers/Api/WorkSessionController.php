<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSession;
use App\Models\Screenshot;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WorkSessionController extends Controller
{
    /**
     * Get current active session for authenticated user
     */
    public function current(Request $request)
    {
        try {
            $user = $request->user();

            // Get the most recent active session
            $session = WorkSession::where('user_id', $user->id)
                ->where('is_active', true)
                ->latest()
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'No active session',
                    'session' => null
                ], 200);
            }

            return response()->json([
                'message' => 'Current session retrieved',
                'session' => $this->formatSessionResponse($session)
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Get current session error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve session',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Start a new work session
     */
    public function start(Request $request)
    {
        try {
            $user = $request->user();

            // Check if user already has an active session
            $existingSession = WorkSession::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($existingSession) {
                return response()->json([
                    'message' => 'User already has an active session',
                    'session' => $this->formatSessionResponse($existingSession)
                ], 409);
            }

            // Create new session with secure tracking
            $session = WorkSession::create([
                'user_id' => $user->id,
                'start_time' => now(),
                'is_active' => true,
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 255)
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $session->id,
                'action' => 'SESSION_STARTED',
                'description' => 'Work session started',
                'ip_address' => $request->ip()
            ]);

            \Log::info('Session started', ['user_id' => $user->id, 'session_id' => $session->id]);

            return response()->json([
                'message' => 'Session started successfully',
                'session' => $this->formatSessionResponse($session)
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Start session error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to start session',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Pause a work session
     */
    public function pause(Request $request, $id)
    {
        try {
            $user = $request->user();

            $session = WorkSession::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'Session not found'
                ], 404);
            }

            if (!$session->is_active) {
                return response()->json([
                    'message' => 'Session is not active'
                ], 409);
            }

            $session->update([
                'is_active' => false,
                'paused_at' => now()
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $session->id,
                'action' => 'SESSION_PAUSED',
                'description' => 'Work session paused',
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Session paused successfully',
                'session' => $this->formatSessionResponse($session)
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Pause session error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to pause session',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Resume a paused work session
     */
    public function resume(Request $request, $id)
    {
        try {
            $user = $request->user();

            $session = WorkSession::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'Session not found'
                ], 404);
            }

            $session->update([
                'is_active' => true,
                'paused_at' => null
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $session->id,
                'action' => 'SESSION_RESUMED',
                'description' => 'Work session resumed',
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Session resumed successfully',
                'session' => $this->formatSessionResponse($session)
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Resume session error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to resume session',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Stop a work session
     */
    public function stop(Request $request, $id)
    {
        try {
            $user = $request->user();

            $session = WorkSession::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'Session not found'
                ], 404);
            }

            if (!$session->is_active && !$session->paused_at) {
                return response()->json([
                    'message' => 'Session is already stopped'
                ], 409);
            }

            $session->update([
                'is_active' => false,
                'end_time' => now()
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $session->id,
                'action' => 'SESSION_STOPPED',
                'description' => 'Work session stopped',
                'ip_address' => $request->ip()
            ]);

            \Log::info('Session stopped', ['user_id' => $user->id, 'session_id' => $session->id]);

            return response()->json([
                'message' => 'Session stopped successfully',
                'session' => $this->formatSessionResponse($session)
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Stop session error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to stop session',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Upload screenshot (secure)
     */
    public function screenshot(Request $request)
    {
        try {
            $validated = $request->validate([
                'session_id' => 'required|integer|exists:work_sessions,id',
                'image_data' => 'required|string',
                'idle_detected' => 'boolean'
            ]);

            $user = $request->user();
            $session = WorkSession::where('id', $validated['session_id'])
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'Session not found or unauthorized'
                ], 404);
            }

            // Decode and validate image data (must be base64)
            try {
                $imageData = base64_decode($validated['image_data'], true);
                if (!$imageData) {
                    throw new \Exception('Invalid base64 image data');
                }
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Invalid image data'
                ], 422);
            }

            // Generate secure filename
            $filename = 'screenshots/' . $user->id . '/' . $session->id . '/' . 
                       Str::random(32) . '_' . time() . '.png';

            // Store in non-public storage for security
            Storage::disk('screenshots')->put($filename, $imageData);

            // Create database record with generated token for temporary access
            $accessToken = Str::random(64);
            $screenshot = Screenshot::create([
                'session_id' => $session->id,
                'user_id' => $user->id,
                'file_path' => $filename,
                'idle_detected' => $validated['idle_detected'] ?? false,
                'access_token' => hash('sha256', $accessToken),
                'access_token_expires_at' => now()->addHours(24),
                'ip_address' => $request->ip()
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'session_id' => $session->id,
                'action' => 'SCREENSHOT_CAPTURED',
                'description' => 'Screenshot captured',
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Screenshot uploaded successfully',
                'screenshot' => [
                    'id' => $screenshot->id,
                    'session_id' => $screenshot->session_id,
                    'captured_at' => $screenshot->created_at,
                    'idle_detected' => $screenshot->idle_detected
                    // Note: access_token and file_path NOT returned in response
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Screenshot upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to upload screenshot',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Format session response to prevent leaking sensitive data
     */
    private function formatSessionResponse(WorkSession $session): array
    {
        return [
            'id' => $session->id,
            'user_id' => $session->user_id,
            'start_time' => $session->start_time,
            'end_time' => $session->end_time,
            'is_active' => $session->is_active,
            'created_at' => $session->created_at,
            'updated_at' => $session->updated_at
            // ip_address and user_agent NOT included in response
        ];
    }
}
