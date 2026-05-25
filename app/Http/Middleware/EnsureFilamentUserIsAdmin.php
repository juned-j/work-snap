<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;

class EnsureFilamentUserIsAdmin
{
   public function handle(Request $request, Closure $next)
{
    $user = auth()->user();

    if (! $user) {
        return redirect()->route('filament.admin.auth.login');
    }

    if (! $user->hasVerifiedEmail()) {
        return redirect()->route('verification.notice');
    }

  

    return $next($request);
}
}