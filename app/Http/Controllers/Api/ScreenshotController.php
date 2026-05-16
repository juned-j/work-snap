<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Screenshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ScreenshotController extends Controller
{
    /**
     * Get screenshot for viewing (authorized users only)
     */
    public function show(Request $request, $screenshotId)
    {
        try {
            $user = $request->user();

            // Fetch screenshot
            $screenshot = Screenshot::where('id', $screenshotId)
                ->where('user_id', $user->id)
                ->first();

            if (!$screenshot) {
                return response()->json([
                    'message' => 'Screenshot not found'
                ], 404);
            }

            // Check if access token is valid (24-hour expiration)
            if (!$screenshot->isAccessTokenValid()) {
                return response()->json([
                    'message' => 'Screenshot access expired. Please refresh.',
                    'expired' => true
                ], 403);
            }

            // Log access
            \Log::info('Screenshot accessed', [
                'user_id' => $user->id,
                'screenshot_id' => $screenshot->id,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Screenshot retrieved successfully',
                'screenshot' => [
                    'id' => $screenshot->id,
                    'session_id' => $screenshot->session_id,
                    'captured_at' => $screenshot->captured_at,
                    'idle_detected' => $screenshot->idle_detected,
                    'expires_at' => $screenshot->access_token_expires_at
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Screenshot retrieval error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve screenshot',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Download screenshot with security checks
     * Returns binary image file only if authorized
     */
    public function download(Request $request, $screenshotId)
    {
        try {
            $user = $request->user();

            // Fetch screenshot with strict authorization
            $screenshot = Screenshot::where('id', $screenshotId)
                ->where('user_id', $user->id)
                ->first();

            if (!$screenshot) {
                return response()->json([
                    'message' => 'Screenshot not found'
                ], 404);
            }

            // Check access token validity
            if (!$screenshot->isAccessTokenValid()) {
                return response()->json([
                    'message' => 'Screenshot access expired',
                    'expired' => true
                ], 403);
            }

            // Verify file exists
            if (!Storage::disk('screenshots')->exists($screenshot->file_path)) {
                \Log::error('Screenshot file missing', [
                    'screenshot_id' => $screenshot->id,
                    'file_path' => $screenshot->file_path
                ]);
                return response()->json([
                    'message' => 'Screenshot file not found'
                ], 404);
            }

            // Log download
            \Log::info('Screenshot downloaded', [
                'user_id' => $user->id,
                'screenshot_id' => $screenshot->id,
                'ip' => $request->ip()
            ]);

            // Stream file directly without exposing path
            return response()->streamDownload(
                function () use ($screenshot) {
                    echo Storage::disk('screenshots')->get($screenshot->file_path);
                },
                'screenshot_' . $screenshot->id . '.png',
                [
                    'Content-Type' => 'image/png',
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                    // Prevent viewing in browser (security)
                    'Content-Disposition' => 'attachment; filename="screenshot_' . $screenshot->id . '.png"'
                ]
            );

        } catch (\Exception $e) {
            \Log::error('Screenshot download error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to download screenshot',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get user's screenshots with pagination
     */
    public function list(Request $request)
    {
        try {
            $user = $request->user();
            $sessionId = $request->query('session_id');
            $limit = min($request->query('limit', 50), 100); // Max 100
            $page = $request->query('page', 1);

            $query = Screenshot::where('user_id', $user->id);

            if ($sessionId) {
                $query->where('session_id', $sessionId);
            }

            $screenshots = $query
                ->latest()
                ->paginate($limit);

            // Hide sensitive fields in response
            $screenshots->getCollection()->transform(function ($screenshot) {
                return [
                    'id' => $screenshot->id,
                    'session_id' => $screenshot->session_id,
                    'captured_at' => $screenshot->captured_at,
                    'idle_detected' => $screenshot->idle_detected,
                    'expires_at' => $screenshot->access_token_expires_at
                ];
            });

            return response()->json([
                'message' => 'Screenshots retrieved successfully',
                'data' => $screenshots
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Screenshots list error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve screenshots',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete screenshot (permanent)
     */
    public function delete(Request $request, $screenshotId)
    {
        try {
            $user = $request->user();

            $screenshot = Screenshot::where('id', $screenshotId)
                ->where('user_id', $user->id)
                ->first();

            if (!$screenshot) {
                return response()->json([
                    'message' => 'Screenshot not found'
                ], 404);
            }

            // Delete physical file
            if (Storage::disk('screenshots')->exists($screenshot->file_path)) {
                Storage::disk('screenshots')->delete($screenshot->file_path);
            }

            // Delete database record
            $screenshot->delete();

            // Log deletion
            \Log::info('Screenshot deleted', [
                'user_id' => $user->id,
                'screenshot_id' => $screenshotId,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Screenshot deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Screenshot deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete screenshot',
                'error' => 'An error occurred'
            ], 500);
        }
    }
}
