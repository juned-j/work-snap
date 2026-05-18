<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureFilamentUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if ($user && ! $user->isAdmin()) {
            auth()->logout();

            abort(403, 'You are not authorized to access the admin panel.');
        }

        return $next($request);
    }
}
