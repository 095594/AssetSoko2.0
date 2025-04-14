<?php
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::routes(['middleware' => ['web', 'auth']]);

// Private user-specific channel
Broadcast::channel('private-user.{id}', function ($user, $id) {
    $authorized = (int) $user->id === (int) $id;
    
    Log::info('Channel authorization for private-user.' . $id, [
        'user_id' => $user->id,
        'requested_id' => $id,
        'authorized' => $authorized
    ]);
    
    return $authorized;
});

// Public auction channel
Broadcast::channel('auctions', function () {
    Log::info("Access to auctions channel");
    return true;
});

// Public channel for specific auction
Broadcast::channel('auction.{id}', function ($user, $id) {
    Log::info("Access to auction.{$id} channel", [
        'user_id' => $user->id,
        'auction_id' => $id
    ]);
    return true;
});
