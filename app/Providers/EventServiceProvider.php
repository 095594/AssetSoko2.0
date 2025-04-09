<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\BidPlaced;
use App\Events\WatchlistUpdated;
use App\Events\AuctionCompleted;
use App\Listeners\HandleBidPlaced;
use App\Listeners\HandleWatchlistUpdated;
use App\Listeners\HandleAuctionCompleted;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        BidPlaced::class => [
            HandleBidPlaced::class,
        ],
        WatchlistUpdated::class => [
            HandleWatchlistUpdated::class,
        ],
        AuctionCompleted::class => [
            HandleAuctionCompleted::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
} 