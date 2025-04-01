<?php

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\BidController;
// use App\Http\Controllers\TransactionController;
// use App\Http\Controllers\WatchlistController;
// use App\Http\Controllers\AssetController;
// use App\Http\Controllers\AuctionController;

// Route::get('/assets/search', [AssetController::class, 'search']);


// Route::middleware(['auth'])->group(function () {
 
    

//     Route::get('/auctions', [AuctionController::class, 'index']); // Fetch all active auctions
//     Route::get('/auction/{id}', [AuctionController::class, 'show']); // Get single asset details
//     Route::post('/auction', [AuctionController::class, 'store']); // Create auction (Seller)
//     Route::post('/auction/{id}/bid', [AuctionController::class, 'placeBid']); // Place bid (Buyer)
//     Route::post('/auction/{id}/watch', [AuctionController::class, 'watchAuction']); // Watch auction
//     Route::post('/auction/{id}/end', [AuctionController::class, 'endAuction']); // End auction manually (Admin)
    
//     Route::get('/assets/search', [AssetController::class, 'search']);

//     Route::get('/bids/active', [BidController::class, 'getActiveBids']);
//     Route::get('/transactions/recent', [TransactionController::class, 'getRecentTransactions']);
//     Route::get('/watchlist', [WatchlistController::class, 'getWatchlist']);
// });

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/assets/{asset}', function (App\Models\Asset $asset) {
        return $asset->load(['seller', 'bids']);
    });
});


