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

        // NOT LOGGED IN
        if (! $user) {
            return redirect()->route('filament.admin.auth.login');
        }

        // EMAIL NOT VERIFIED
        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        // NOT ADMIN
        if (! $user->isAdmin()) {

            auth()->logout();

            abort(403, 'You are not authorized to access the admin panel.');
        }

        return $next($request);
    }
}