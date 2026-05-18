<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\Api\WorkSessionController;
use App\Http\Controllers\Api\ScreenshotController;
use App\Http\Controllers\Api\ActivityLogController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes (no token required)
Route::post('/auth/register', [ApiAuthController::class, 'register']);
Route::post('/auth/login', [ApiAuthController::class, 'login']);

// Protected routes (require valid token)
Route::middleware('api.token')->group(function () {
    // Authentication
    Route::post('/auth/logout', [ApiAuthController::class, 'logout']);

    // Work Sessions
    Route::get('/session/current', [WorkSessionController::class, 'current']);
    Route::get('/session/latest', [WorkSessionController::class, 'latest']);
    Route::post('/session/start', [WorkSessionController::class, 'start']);
    Route::post('/session/pause/{id}', [WorkSessionController::class, 'pause']);
    Route::post('/session/resume/{id}', [WorkSessionController::class, 'resume']);
    Route::post('/session/stop/{id}', [WorkSessionController::class, 'stop']);

    // Screenshots
    Route::post('/screenshot', [WorkSessionController::class, 'screenshot']);
    Route::get('/screenshots', [ScreenshotController::class, 'list']);
    Route::get('/screenshot/{screenshotId}', [ScreenshotController::class, 'show']);
    Route::get('/screenshot/{screenshotId}/download', [ScreenshotController::class, 'download']);
    Route::delete('/screenshot/{screenshotId}', [ScreenshotController::class, 'delete']);

    // Activity Logs
    Route::post('/activities', [ActivityLogController::class, 'store']);
    Route::post('/activities/batch', [ActivityLogController::class, 'storeBatch']);
    Route::get('/activities', [ActivityLogController::class, 'index']);
    Route::get('/session/{sessionId}/activities/summary', [ActivityLogController::class, 'summary']);
    Route::get('/activities/admin', [ActivityLogController::class, 'listAll']); // Admin only

    // Settings
    Route::get('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'index']);
    Route::post('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'update']);
    Route::post('/settings/reset', [\App\Http\Controllers\Api\SettingsController::class, 'reset']);
    Route::get('/settings/status', [\App\Http\Controllers\Api\SettingsController::class, 'status']);
});

