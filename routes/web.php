<?php

use App\Http\Controllers\WorkSessionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkSnapOnboardingController;
use App\Http\Controllers\BillingController;

Route::get('/', function () {
    return view('home');
});


Route::middleware(['web'])->group(function () {
    
    Route::get('/register', [WorkSnapOnboardingController::class, 'showGymStep'])
        ->name('register.gym');

    Route::post('/register/gym', [WorkSnapOnboardingController::class, 'storeGym'])
        ->name('register.gym.store');

    Route::get('/register/user', [WorkSnapOnboardingController::class, 'showUserStep'])
        ->name('register.user');

    Route::post('/register/user', [WorkSnapOnboardingController::class, 'storeUser'])
        ->name('register.user.store');

    Route::get('/register/plan', [WorkSnapOnboardingController::class, 'showPlans'])
        ->name('register.plan');

    Route::post('/register/plan', [WorkSnapOnboardingController::class, 'storePlan'])
        ->name('register.plan.store');

    Route::post('/register/checkout', [WorkSnapOnboardingController::class, 'createCheckout'])
        ->name('register.checkout');
        
});

Route::get('/email/verify/{id}/{hash}', [WorkSnapOnboardingController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');

Route::post('/email/verification-notification', function (Request $request) {

    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');

})->middleware(['auth', 'throttle:6,1'])
  ->name('verification.send');




Route::get('/billing/plans', [BillingController::class, 'index'])
    ->name('billing.plans');

Route::post('/billing/subscribe', [BillingController::class, 'subscribe'])
    ->name('billing.subscribe');

Route::get('/billing/success', [BillingController::class, 'success'])
    ->name('billing.success');




    Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');


