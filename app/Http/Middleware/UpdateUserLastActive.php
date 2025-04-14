<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateUserLastActive
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            \Log::info('Updating last active for user: ' . Auth::id());
            Auth::user()->updateLastActive();
        }

        return $next($request);
    }
} 