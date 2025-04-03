<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BidController extends Controller
{
    public function getActiveBids(Request $request)
    {
        return response()->json(Bid::with(['asset', 'auction'])->where('user_id', $request->user()->id)->get());
    }

    public function index()
    {
        $user = auth()->user();
        
        $activeBids = $user->bids()
            ->with(['asset' => function($query) {
                $query->with(['user', 'bids' => function($q) {
                    $q->latest()->limit(1);
                }]);
                $query->where('auction_end_time', '>', now());
            }])
            ->whereHas('asset', function($query) {
                $query->where('auction_end_time', '>', now());
            })
            ->latest()
            ->get()
            ->map(function ($bid) {
                return [
                    'id' => $bid->id,
                    'asset_id' => $bid->asset_id,
                    'amount' => $bid->amount,
                    'created_at' => $bid->created_at,
                    'asset' => [
                        'id' => $bid->asset->id,
                        'name' => $bid->asset->name,
                        'current_price' => $bid->asset->current_price,
                        'auction_end_time' => $bid->asset->auction_end_time,
                        'user' => [
                            'id' => $bid->asset->user->id,
                            'name' => $bid->asset->user->name,
                        ],
                    ],
                    'current_bid' => $bid->asset->bids->first()?->amount ?? $bid->asset->current_price,
                ];
            });

        return Inertia::render('Buyer/Bids/Index', [
            'activeBids' => $activeBids,
            'darkMode' => $user->dark_mode,
        ]);
    }

    public function store(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);
        
        $request->validate([
            'amount' => ['required', 'numeric', 'min:' . ($asset->current_price + 1)],
        ]);

        $bid = $asset->bids()->create([
            'user_id' => auth()->id(),
            'amount' => $request->amount,
        ]);

        // Send notification to asset owner
        $asset->notifyNewBid($bid);

        return back()->with('success', 'Bid placed successfully!');
    }

    public function stats()
    {
        $user = auth()->user();
        
        $totalBids = $user->bids()->count();
        
        $activeBids = $user->bids()
            ->whereHas('asset', function($query) {
                $query->where('auction_end_time', '>', now())
                      ->where('status', 'active');
            })
            ->count();
        
        $wonBids = $user->bids()
            ->whereHas('asset', function($query) {
                $query->where('auction_end_time', '<', now())
                      ->where('status', 'completed');
            })
            ->where('is_winning', true)
            ->count();
        
        $lostBids = $user->bids()
            ->whereHas('asset', function($query) {
                $query->where('auction_end_time', '<', now())
                      ->where('status', 'completed');
            })
            ->where('is_winning', false)
            ->count();

        return response()->json([
            'totalBids' => $totalBids,
            'activeBids' => $activeBids,
            'wonBids' => $wonBids,
            'lostBids' => $lostBids
        ]);
    }
}
