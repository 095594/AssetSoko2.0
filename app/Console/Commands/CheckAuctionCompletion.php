<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Events\AuctionCompleted;
use App\Notifications\AuctionCompletedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckAuctionCompletion extends Command
{
    protected $signature = 'auctions:check-completion';
    protected $description = 'Check for completed auctions and process them';

    public function handle()
    {
        \Log::info('Starting auction completion check at: ' . now());
        
        // Get all assets where auction has ended but status is not completed
        $completedAssets = Asset::where('auction_end_time', '<=', now())
            ->where('status', '!=', 'completed')
            ->get();

        \Log::info('Found ' . $completedAssets->count() . ' completed auctions to process');

        foreach ($completedAssets as $asset) {
            try {
                \Log::info('Processing auction completion for asset: ' . $asset->id);
                $this->processCompletedAuction($asset);
                \Log::info("Successfully processed completed auction for asset: {$asset->name}");
            } catch (\Exception $e) {
                \Log::error("Error processing auction completion for asset {$asset->id}: " . $e->getMessage());
                $this->error("Failed to process auction for asset: {$asset->name}");
            }
        }

        \Log::info('Finished checking auction completion at: ' . now());
    }

    protected function processCompletedAuction(Asset $asset)
    {
        \Log::info('Processing completed auction for asset: ' . $asset->id);
        
        // Get the winning bid (highest bid)
        $winningBid = Bid::where('asset_id', $asset->id)
            ->orderBy('amount', 'desc')
            ->first();

        if ($winningBid) {
            \Log::info('Found winning bid for asset ' . $asset->id . ': ' . $winningBid->amount . ' by user ' . $winningBid->user_id);
            
            // Update all bids for this asset
            Bid::where('asset_id', $asset->id)
                ->update(['status' => 'outbid']);
            
            // Update winning bid status
            $winningBid->update(['status' => 'won']);
            \Log::info('Updated winning bid status for user: ' . $winningBid->user_id);

            // Create payment record
            $payment = Payment::create([
                'user_id' => $winningBid->user_id,
                'buyer_id' => $winningBid->user_id,
                'seller_id' => $asset->user_id,
                'asset_id' => $asset->id,
                'bid_id' => $winningBid->id,
                'amount' => $winningBid->amount,
                'status' => 'pending',
                'due_date' => now()->addDays(1),
            ]);
            \Log::info('Created payment record: ' . $payment->id);

            // Send immediate notification to winner
            $winningBid->user->notify(new AuctionCompletedNotification($asset, $winningBid));
            \Log::info('Sent notification to winner: ' . $winningBid->user_id);

            // Send immediate notification to seller
            $asset->user->notify(new \App\Notifications\AuctionEndedNotification($asset, $winningBid));
            \Log::info('Sent notification to seller: ' . $asset->user_id);

            // Update asset status
            $asset->update([
                'status' => 'completed',
                'winner_id' => $winningBid->user_id,
                'final_price' => $winningBid->amount,
            ]);
            \Log::info('Updated asset status to completed: ' . $asset->id);

            // Broadcast auction completion event
            broadcast(new AuctionCompleted($asset, $winningBid->user, $winningBid))->toOthers();
            \Log::info('Broadcasted auction completed event for asset: ' . $asset->id);
        } else {
            \Log::info('No winning bid found for asset: ' . $asset->id);
            // No bids were placed
            $asset->update(['status' => 'completed']);
        }
    }
} 