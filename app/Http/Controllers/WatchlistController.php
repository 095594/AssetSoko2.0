<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Watchlist;
use App\Models\Asset;
use Inertia\Inertia;
use App\Events\WatchlistUpdated;

class WatchlistController extends Controller
{
    public function index()
    {
        $watchlist = Asset::whereHas('watchlist', function ($query) {
            $query->where('user_id', auth()->id());
        })->with(['user', 'bids', 'watchlist'])->get();

        return Inertia::render('Buyer/Watchlist', [
            'watchlist' => $watchlist
        ]);
    }

    public function getWatchlist(Request $request)
    {
        return response()->json($request->user()->watchlist()->get());
    }

    public function toggle(Request $request, Asset $asset)
    {
        $isWatching = $asset->isWatchedBy(auth()->user());

        if ($isWatching) {
            $asset->watchlist()->where('user_id', auth()->id())->delete();
        } else {
            $asset->watchlist()->create([
                'user_id' => auth()->id()
            ]);
        }

        return response()->json([
            'isWatching' => !$isWatching
        ]);
    }
}

