<?php

use App\Http\Controllers\WorkSessionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [WorkSessionController::class, 'index'])->name('dashboard');
Route::post('/worksnap/start', [WorkSessionController::class, 'start']);
Route::post('/worksnap/pause', [WorkSessionController::class, 'pause']);
Route::post('/worksnap/stop', [WorkSessionController::class, 'stop']);
Route::post('/dashboard/session/start', [WorkSessionController::class, 'start'])->name('dashboard.session.start');
Route::post('/dashboard/session/pause/{id}', [WorkSessionController::class, 'pause'])->name('dashboard.session.pause');
Route::post('/dashboard/session/resume/{id}', [WorkSessionController::class, 'resume'])->name('dashboard.session.resume');
Route::post('/dashboard/session/stop/{id}', [WorkSessionController::class, 'stop'])->name('dashboard.session.stop');
