<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Asset;
use App\Models\Bid;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get user's watchlist with related data
        $watchlist = Asset::whereIn('id', function($query) use ($user) {
            $query->select('asset_id')
                ->from('watchlists')
                ->where('user_id', $user->id);
        })
        ->with(['user', 'bids'])
        ->get();

        // Get user's active bids
        $activeBids = Bid::where('user_id', $user->id)
            ->with(['asset'])
            ->whereHas('asset', function($query) {
                $query->where('auction_end_time', '>', now());
            })
            ->latest()
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
            'darkMode' => $user->dark_mode ?? false,
        ]);
    }
}
