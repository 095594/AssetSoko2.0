<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\WinningBidNotification;
use Illuminate\Support\Facades\Auth;
use App\Services\AuctionService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Notifications\WinningBidderNotification;

class AuctionController extends Controller
{
    protected $auctionService;

    public function __construct(AuctionService $auctionService)
    {
        $this->auctionService = $auctionService;
    }

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
            $auction->update([
                'status' => 'ended',
                'winner_id' => $winningBid->user_id
            ]);

            // Notify winner via notification system
            $winner = User::find($winningBid->user_id);
            $winner->notify(new WinningBidderNotification($auction, $winningBid));

            return response()->json(['message' => 'Auction ended. Winner has been notified!']);
        }

        return response()->json(['message' => 'No bids were placed. Auction ended without a winner.']);
    }

    public function processEndedAuctions(Request $request)
    {
        // Verify the request is authorized
        if (!$this->isAuthorized($request)) {
            Log::warning('Unauthorized attempt to process ended auctions', [
                'ip' => $request->ip(),
                'headers' => $request->headers->all()
            ]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            Log::info('Starting processing of ended auctions');
            
            // Process ended auctions
            $result = $this->auctionService->processEndedAuctions();
            
            Log::info('Successfully processed ended auctions', [
                'processed_count' => $result['processed_count'] ?? 0,
                'winners_notified' => $result['winners_notified'] ?? 0,
                'sellers_notified' => $result['sellers_notified'] ?? 0
            ]);

            return response()->json([
                'message' => 'Successfully processed ended auctions',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Error processing ended auctions: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to process auctions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    protected function isAuthorized(Request $request)
    {
        $apiKey = $request->header('X-API-Key');
        $expectedKey = config('app.api_key');
        
        return $apiKey && hash_equals($expectedKey, $apiKey);
    }
}
