<?php

namespace App\Listeners;

use App\Events\WatchlistUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleWatchlistUpdated implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(WatchlistUpdated $event)
    {
        // The event is already broadcasting to the user's private channel
        // No additional handling needed here
    }
} 