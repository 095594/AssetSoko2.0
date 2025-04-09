<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Broadcasting\SocketIoBroadcaster;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */

    
    public function boot()
    {
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => Auth::check() ? [
                        'name' => Auth::user()->name,
                        'profile_photo_url' => Auth::user()->profile_picture 
                            ? asset('storage/' . Auth::user()->profile_picture) 
                            : asset('img/default-avatar.png'),
                    ] : null,
                ];
            },
            'version' => function () {
                return \Illuminate\Support\Str::random(10); // Dummy version to avoid errors
            },

        ]);
        // Broadcast::extend('socket.io', function ($app) {
        //     return new SocketIoBroadcaster;
        // });

        // Register commands
        $this->commands([
            \App\Console\Commands\CheckAuctionCompletion::class,
            \App\Console\Commands\FixAuctionTimes::class,
            \App\Console\Commands\TestQueue::class,
            \App\Console\Commands\NotifyEndingAuctions::class,
            \App\Console\Commands\CleanupNotifications::class,
        ]);
    }
    
}
