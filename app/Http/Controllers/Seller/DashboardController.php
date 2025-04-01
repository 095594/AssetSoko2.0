<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get seller's assets
        $assets = Asset::where('user_id', $user->id)
            ->with(['bids' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->take(5)
            ->get();

        // Get total assets count
        $totalAssets = Asset::where('user_id', $user->id)->count();

        // Get active auctions count
        $activeAuctions = Asset::where('user_id', $user->id)
            ->where('auction_end_time', '>', now())
            ->count();

        // Get total bids received
        $totalBids = Bid::whereHas('asset', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

        // Get recent bids
        $recentBids = Bid::whereHas('asset', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['asset', 'user'])
        ->latest()
        ->take(5)
        ->get();

        // Get total revenue (sum of highest bids)
        $totalRevenue = Asset::where('user_id', $user->id)
            ->whereNotNull('current_price')
            ->sum('current_price');

        return Inertia::render('Seller/Dashboard', [
            'assets' => $assets,
            'recentBids' => $recentBids,
            'stats' => [
                'totalAssets' => $totalAssets,
                'activeAuctions' => $activeAuctions,
                'totalBids' => $totalBids,
                'totalRevenue' => $totalRevenue,
            ]
        ]);
    }
}