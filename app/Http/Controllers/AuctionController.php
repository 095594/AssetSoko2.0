<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\WinningBidNotification;
use Illuminate\Support\Facades\Auth;

class AuctionController extends Controller
{
    // Fetch all active auctions
    public function index()
    {
        return Auction::where('status', 'active')->with('bids')->get();
    }

    // Get auction details
    public function show($id)
    {
        $auction = Auction::with(['bids' => function($query) {
            $query->orderBy('amount', 'desc'); // Show highest bid first
        }])->findOrFail($id);

        return response()->json($auction);
    }

    // Create an auction (Only for sellers)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'starting_price' => 'required|numeric|min:0',
            'bid_increment' => 'required|numeric|min:1',
            'end_time' => 'required|date|after:now',
        ]);

        $auction = Auction::create([
            'user_id' => Auth::id(), // Seller's ID
            'name' => $request->name,
            'category' => $request->category,
            'description' => $request->description,
            'starting_price' => $request->starting_price,
            'bid_increment' => $request->bid_increment,
            'end_time' => $request->end_time,
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Auction created successfully!', 'auction' => $auction], 201);
    }

    // Place a bid (Buyers)
    public function placeBid(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);
        
        if ($auction->status !== 'active') {
            return response()->json(['message' => 'Auction has ended'], 400);
        }

        $highestBid = Bid::where('auction_id', $id)->max('amount');
        $minimumBid = $highestBid ? $highestBid + $auction->bid_increment : $auction->starting_price;

        $request->validate([
            'amount' => "required|numeric|min:$minimumBid",
        ]);

        $bid = Bid::create([
            'user_id' => Auth::id(),
            'auction_id' => $id,
            'amount' => $request->amount,
        ]);

        return response()->json(['message' => 'Bid placed successfully!', 'bid' => $bid], 201);
    }

    // Watch an auction
    public function watchAuction(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);
        $auction->watchers()->attach(Auth::id());

        return response()->json(['message' => 'You are now watching this auction!']);
    }

    // End auction & notify winner
    public function endAuction($id)
    {
        $auction = Auction::findOrFail($id);

        if ($auction->status !== 'active') {
            return response()->json(['message' => 'Auction has already ended'], 400);
        }

        $winningBid = Bid::where('auction_id', $id)->orderBy('amount', 'desc')->first();

        if ($winningBid) {
            $auction = Auction::find($auction_id);
            $auction->update([
                'status' => 'ended',
                'winner_id' => $winningBid->user_id
            ]);

            // Notify winner via email
            $winner = User::find($winningBid->user_id);
            Mail::to($winner->email)->send(new WinningBidNotification($auction, $winningBid));

            return response()->json(['message' => 'Auction ended. Winner has been notified!']);
        }

        return response()->json(['message' => 'No bids were placed. Auction ended without a winner.']);
    }
}
