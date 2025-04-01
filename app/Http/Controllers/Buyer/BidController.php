<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Bid;
use App\Notifications\NewBidNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BidController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        $request->validate([
            'amount' => 'required|numeric|min:' . max($asset->current_price ?? $asset->base_price, $asset->base_price),
        ]);

        try {
            DB::beginTransaction();

            // Create the bid
            $bid = Bid::create([
                'asset_id' => $asset->id,
                'user_id' => auth()->id(),
                'amount' => $request->amount,
            ]);

            // Update asset's current price
            $asset->update([
                'current_price' => $request->amount,
            ]);

            // Send notifications
            $asset->user->notify(new NewBidNotification($asset, $bid));
            auth()->user()->notify(new NewBidNotification($asset, $bid));

            DB::commit();

            return back()->with('success', 'Bid placed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to place bid. Please try again.');
        }
    }
} 