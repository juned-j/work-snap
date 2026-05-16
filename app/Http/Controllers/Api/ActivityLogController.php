<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get user's activity logs with pagination
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $sessionId = $request->query('session_id');
            $action = $request->query('action');
            $limit = min($request->query('limit', 50), 100); // Max 100 per page
            $page = $request->query('page', 1);

            $query = ActivityLog::where('user_id', $user->id);

            if ($sessionId) {
                $query->where('session_id', $sessionId);
            }

            if ($action) {
                $query->where('action', $action);
            }

            $logs = $query
                ->latest()
                ->paginate($limit);

            // Format response - hide sensitive data
            $logs->getCollection()->transform(function ($log) {
                return [
                    'id' => $log->id,
                    'session_id' => $log->session_id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                    'metadata' => $log->metadata
                    // ip_address and user_agent NOT included
                ];
            });

            return response()->json([
                'message' => 'Activity logs retrieved successfully',
                'data' => $logs
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Activity logs retrieval error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve activity logs',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get activity summary for session
     */
    public function summary(Request $request, $sessionId)
    {
        try {
            $user = $request->user();

            // Verify session belongs to user
            $session = \App\Models\WorkSession::where('id', $sessionId)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'Session not found'
                ], 404);
            }

            // Get activity summary
            $logs = ActivityLog::where('session_id', $sessionId)
                ->groupBy('action')
                ->selectRaw('action, COUNT(*) as count')
                ->get();

            $summary = [];
            foreach ($logs as $log) {
                $summary[$log->action] = $log->count;
            }

            // Get total activities count
            $totalActivities = ActivityLog::where('session_id', $sessionId)->count();

            return response()->json([
                'message' => 'Activity summary retrieved',
                'session_id' => $sessionId,
                'total_activities' => $totalActivities,
                'summary' => $summary,
                'session' => [
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'duration_hours' => $session->duration_hours
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Activity summary error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve activity summary',
                'error' => 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get all activities for admin/manager (with user_id scope)
     * @internal Admin only
     */
    public function listAll(Request $request)
    {
        try {
            $user = $request->user();

            // Check admin/manager role
            if ($user->role !== 'admin' && $user->role !== 'manager') {
                return response()->json([
                    'message' => 'Unauthorized - Admin access required'
                ], 403);
            }

            $userId = $request->query('user_id');
            $limit = min($request->query('limit', 50), 100);

            $query = ActivityLog::latest();

            if ($userId) {
                $query->where('user_id', $userId);
            }

            $logs = $query->paginate($limit);

            return response()->json([
                'message' => 'Activity logs retrieved',
                'data' => $logs
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Activity logs admin retrieval error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve activity logs',
                'error' => 'An error occurred'
            ], 500);
        }
    }
}
