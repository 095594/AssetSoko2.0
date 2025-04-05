<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get active bids (bids on assets that are still active)
        $activeBids = Bid::where('user_id', $user->id)
            ->whereHas('asset', function ($query) {
                $query->where('status', 'active')
                    ->where('auction_end_time', '>', now());
            })
            ->with(['asset' => function ($query) {
                $query->select('id', 'name', 'current_price', 'auction_end_time');
            }])
            ->get();

        // Calculate bid statistics
        $totalBids = Bid::where('user_id', $user->id)->count();

        $activeBidsCount = Bid::where('user_id', $user->id)
            ->whereHas('asset', function ($query) {
                $query->where('status', 'active')
                    ->where('auction_end_time', '>', now());
            })
            ->count();

        // Get completed assets where user has bid
        $completedAssets = Asset::where('status', 'completed')
            ->whereHas('bids', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();

        // Calculate won and lost bids
        $wonBids = 0;
        $lostBids = 0;

        foreach ($completedAssets as $asset) {
            // Get the highest bid for this asset
            $highestBid = Bid::where('asset_id', $asset->id)
                ->orderBy('amount', 'desc')
                ->first();
            
            if ($highestBid && $highestBid->user_id === $user->id) {
                $wonBids++;
            } else {
                $lostBids++;
            }
        }

        // Get recommended assets
        $recommendedAssets = Asset::where('status', 'active')
            ->where('auction_end_time', '>', now())
            ->whereDoesntHave('bids', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->latest()
            ->take(5)
            ->get();

        // Get user's watchlist with related data
        $watchlist = Asset::whereIn('id', function($query) use ($user) {
            $query->select('asset_id')
                ->from('watchlists')
                ->where('user_id', $user->id);
        })
        ->with(['user', 'bids'])
        ->get();

        // Get recent assets
        $recentAssets = Asset::with(['user'])
            ->where('auction_end_time', '>', now())
            ->latest()
            ->take(5)
            ->get();

        // Get bid activity for the last 30 days
        $bidActivity = Bid::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Get notifications
        $notifications = $user->notifications()
            ->select(['id', 'type', 'data', 'read_at', 'created_at'])
            ->latest()
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'message' => $notification->data['message'] ?? '',
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });

        return Inertia::render('Buyer/Dashboard', [
            'activeBids' => $activeBids,
            'watchlist' => $watchlist,
            'notifications' => $notifications,
            'recentAssets' => $recentAssets,
            'bidActivity' => $bidActivity,
            'recommendedAssets' => $recommendedAssets,
            'bidStats' => [
                'totalBids' => $totalBids,
                'activeBids' => $activeBidsCount,
                'wonBids' => $wonBids,
                'lostBids' => $lostBids
            ],
            'darkMode' => $user->dark_mode ?? false,
        ]);
    }
}
