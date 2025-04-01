<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Bid;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BidController extends Controller
{
    public function index()
    {
        $bids = Bid::whereHas('asset', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->with(['asset', 'user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Seller/Bids/Index', [
            'bids' => $bids
        ]);
    }

    public function show(Bid $bid)
    {
        $this->authorize('view', $bid->asset);

        $bid->load(['asset', 'user']);

        return Inertia::render('Seller/Bids/Show', [
            'bid' => $bid
        ]);
    }

    public function getAssetBids(Asset $asset)
    {
        $this->authorize('view', $asset);

        $bids = $asset->bids()
            ->with('user')
            ->latest()
            ->paginate(10);

        return Inertia::render('Seller/Bids/AssetBids', [
            'asset' => $asset,
            'bids' => $bids
        ]);
    }
} 