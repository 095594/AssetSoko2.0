<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Models\User;
use App\Events\AuctionEndedBroadcast;
use App\Notifications\AuctionEndedNotification;
use App\Notifications\WinningBidderNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AuctionService
{
    public function processEndedAuctions()
    {
        Log::info('Starting to process ended auctions');
        
        // Use consistent timezone
        $now = Carbon::now()->setTimezone(config('app.timezone'));
        Log::info('Current time:', [
            'time' => $now->toDateTimeString(),
            'timezone' => $now->timezone
        ]);

        try {
            // Use whereRaw for proper timezone comparison
            $query = Asset::whereRaw('DATE_ADD(auction_end_time, INTERVAL ? HOUR) <= ?', 
                    [config('app.timezone_offset', 3), $now])  // 3 is for EAT timezone
                ->where('status', 'active')
                ->with(['bids' => function ($query) {
                    $query->orderBy('amount', 'desc');
                }, 'user:id,name,email']);

            // Log the SQL query
            Log::info('SQL query:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            $endedAuctions = $query->get();
            Log::info('Found ' . $endedAuctions->count() . ' ended auctions to process');

            foreach ($endedAuctions as $asset) {
                try {
                    DB::beginTransaction();
                    Log::info("Processing auction for asset: {$asset->id}", [
                        'asset_name' => $asset->name,
                        'end_time' => $asset->auction_end_time,
                        'status' => $asset->status,
                        'bid_count' => $asset->bids->count()
                    ]);

                    // Update asset status
                    $asset->status = 'ended';
                    $asset->save();

                    // Get winning bid
                    $winningBid = $asset->bids->first();
                    Log::info("Winning bid for asset {$asset->id}:", [
                        'bid' => $winningBid ? [
                            'id' => $winningBid->id,
                            'amount' => $winningBid->amount,
                            'user_id' => $winningBid->user_id
                        ] : 'none'
                    ]);

                    if ($winningBid) {
                        // Create payment record
                        $payment = Payment::create([
                            'asset_id' => $asset->id,
                            'bid_id' => $winningBid->id,
                            'buyer_id' => $winningBid->user_id,
                            'seller_id' => $asset->user_id,
                            'amount' => $winningBid->amount,
                            'status' => 'pending',
                            'payment_method' => 'pending',
                        ]);
                        Log::info("Created payment record", [
                            'payment_id' => $payment->id,
                            'amount' => $payment->amount
                        ]);

                        try {
                            // Notify winning bidder
                            $winningBidder = User::findOrFail($winningBid->user_id);
                            
                            // Send email notification
                            $winningBidder->notify(new WinningBidderNotification($asset, $winningBid));
                            
                            // Broadcast real-time notification to winner
                            broadcast(new AuctionEndedBroadcast($asset, $winningBid, 'winner', $winningBidder->id));
                            
                            Log::info("Sent notifications to winning bidder", [
                                'user_id' => $winningBidder->id,
                                'email' => $winningBidder->email
                            ]);

                            // Notify seller
                            $seller = User::findOrFail($asset->user_id);
                            
                            // Send email notification
                            $seller->notify(new AuctionEndedNotification($asset, $winningBid));
                            
                            // Broadcast real-time notification to seller
                            broadcast(new AuctionEndedBroadcast($asset, $winningBid, 'seller', $seller->id));
                            
                            Log::info("Sent notifications to seller", [
                                'user_id' => $seller->id,
                                'email' => $seller->email
                            ]);

                            // Notify outbid users
                            $outbidUsers = $asset->bids()
                                ->where('user_id', '!=', $winningBid->user_id)
                                ->select('user_id')
                                ->distinct()
                                ->get();

                            foreach ($outbidUsers as $outbidUser) {
                                $user = User::find($outbidUser->user_id);
                                if ($user) {
                                    // Send email notification
                                    $user->notify(new AuctionEndedNotification($asset, $winningBid));
                                    
                                    // Broadcast real-time notification
                                    broadcast(new AuctionEndedBroadcast($asset, null, 'outbid', $user->id));
                                    
                                    Log::info("Sent notifications to outbid user", [
                                        'user_id' => $user->id,
                                        'email' => $user->email
                                    ]);
                                }
                            }

                        } catch (\Exception $e) {
                            Log::error("Error sending notifications: " . $e->getMessage());
                        }
                    }

                    DB::commit();
                    Log::info("Successfully processed auction for asset: {$asset->id}");
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error("Error processing auction for asset {$asset->id}: " . $e->getMessage());
                    continue;
                }
            }
        } catch (\Exception $e) {
            Log::error("Error in processEndedAuctions: " . $e->getMessage());
        }
    }
}