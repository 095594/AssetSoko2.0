<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Models\Bid;
use App\Events\AuctionCompleted;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckAuctionCompletion extends Command
{
    protected $signature = 'auctions:check-completion';
    protected $description = 'Check for completed auctions and process them';

    public function handle()
    {
        $this->info('Checking for completed auctions...');
        
        // Get all assets where auction has ended but status is not completed
        $completedAssets = Asset::where('auction_end_time', '<=', now())
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($completedAssets as $asset) {
            try {
                $this->processCompletedAuction($asset);
                $this->info("Processed completed auction for asset: {$asset->name}");
            } catch (\Exception $e) {
                Log::error("Error processing auction completion for asset {$asset->id}: " . $e->getMessage());
                $this->error("Failed to process auction for asset: {$asset->name}");
            }
        }

        $this->info('Finished checking auction completion.');
    }

    protected function processCompletedAuction(Asset $asset)
    {
        // Get the winning bid (highest bid)
        $winningBid = Bid::where('asset_id', $asset->id)
            ->orderBy('amount', 'desc')
            ->first();

        if ($winningBid) {
            // Update all bids for this asset
            Bid::where('asset_id', $asset->id)
                ->update(['status' => 'outbid']);
            
            // Mark the winning bid
            $winningBid->status = 'accepted';
            $winningBid->save();

            // Create payment record
            \App\Models\Payment::create([
                'asset_id' => $asset->id,
                'bid_id' => $winningBid->id,
                'buyer_id' => $winningBid->user_id,
                'seller_id' => $asset->user_id,
                'amount' => $winningBid->amount,
                'payment_method' => 'pending', // Will be set when buyer initiates payment
                'status' => 'pending'
            ]);

            // Update asset status
            $asset->status = 'pending_payment';
            $asset->save();

            // Fire the auction completed event
            event(new \App\Events\AuctionCompleted($asset, $winningBid->user, $winningBid->amount));
            
            // Send notification to winner
            $winningBid->user->notify(new \App\Notifications\AuctionWonNotification($asset, $winningBid));
            
            $this->info("Processed completed auction for asset: {$asset->name} - Winner: {$winningBid->user->name}");
        } else {
            // No bids were placed
            $asset->status = 'expired';
            $asset->save();
            $this->info("Processed completed auction for asset: {$asset->name} - No bids placed");
        }
    }
} 