<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\Api\WorkSessionController;

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

Route::post('/auth/register', [ApiAuthController::class, 'register']);
Route::post('/auth/login', [ApiAuthController::class, 'login']);

Route::middleware('api.token')->group(function () {
    Route::post('/auth/logout', [ApiAuthController::class, 'logout']);
    Route::get('/session/current', [WorkSessionController::class, 'current']);
    Route::post('/session/start', [WorkSessionController::class, 'start']);
    Route::post('/session/pause/{id}', [WorkSessionController::class, 'pause']);
    Route::post('/session/resume/{id}', [WorkSessionController::class, 'resume']);
    Route::post('/session/stop/{id}', [WorkSessionController::class, 'stop']);
    Route::post('/screenshot', [WorkSessionController::class, 'screenshot']);
});
