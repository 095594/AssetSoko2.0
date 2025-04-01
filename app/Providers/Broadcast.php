<?php
namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Broadcasting\SocketIoBroadcaster;

class Broadcast extends ServiceProvider
{
}