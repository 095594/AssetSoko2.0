<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Notifications\AssetNotification;
use Carbon\Carbon;
use App\Notifications\WinningBidderNotification;
use App\Notifications\AuctionEndedNotification;
use App\Events\AuctionEnded;
use Illuminate\Support\Facades\Log;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'base_price',
        'reserve_price',
        'current_price',
        'image_url',
        'photos',
        'status',
        'auction_start_time',
        'auction_end_time',
        'user_id',
        'condition'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'reserve_price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'auction_start_time' => 'datetime',
        'auction_end_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'photos' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($asset) {
            if ($asset->isDirty('status') && $asset->status === 'ended') {
                $asset->processEndedAuction();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function watchlist()
    {
        return $this->belongsToMany(User::class, 'watchlists')
            ->withTimestamps();
    }

    public function isWatchedBy(User $user): bool
    {
        return $this->watchlist()->where('user_id', $user->id)->exists();
    }

    public function notifyNewBid(Bid $bid)
    {
        $this->user->notify(new AssetNotification(
            "New bid placed on {$this->name}",
            [
                'asset_id' => $this->id,
                'bid_id' => $bid->id,
                'amount' => $bid->amount,
                'bidder_name' => $bid->user->name,
            ]
        ));
    }

    /**
     * Filter scope for assets
     */
    public function scopeFilter(Builder $query, array $filters)
    {
        if (isset($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['min_price'])) {
            $query->where('base_price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('base_price', '<=', $filters['max_price']);
        }

        return $query;
    }

    protected function getAuctionEndTimeAttribute($value)
    {
        if (!$value) return null;
        return Carbon::parse($value)->setTimezone(config('app.timezone'));
    }

    protected function setAuctionEndTimeAttribute($value)
    {
        if (!$value) {
            $this->attributes['auction_end_time'] = null;
            return;
        }
        
        // Parse the input time in UTC (since that's what we receive from the frontend)
        $utcTime = Carbon::parse($value, 'UTC');
        
        // Store in UTC
        $this->attributes['auction_end_time'] = $utcTime;
    }

    // Alias for user relationship
    public function seller()
    {
        return $this->user();
    }

    public function processEndedAuction()
    {
        Log::info('Starting to process ended auction', [
            'asset_id' => $this->id,
            'asset_name' => $this->name,
            'current_time' => now()
        ]);

        try {
            // Get the winning bid
            $winningBid = $this->bids()
                ->where('status', 'active')
                ->orderBy('amount', 'desc')
                ->first();

            Log::info('Found winning bid', [
                'asset_id' => $this->id,
                'winning_bid_id' => $winningBid ? $winningBid->id : null,
                'winning_bid_amount' => $winningBid ? $winningBid->amount : null
            ]);

            if ($winningBid) {
                // Create payment record
                $payment = Payment::create([
                    'asset_id' => $this->id,
                    'bid_id' => $winningBid->id,
                    'buyer_id' => $winningBid->user_id,
                    'seller_id' => $this->user_id,
                    'amount' => $winningBid->amount,
                    'status' => 'pending',
                    'payment_method' => 'auction',
                    'reference' => 'AUCTION-' . $this->id . '-' . time(),
                ]);

                Log::info('Created payment record', [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'user_id' => $payment->user_id
                ]);

                // Notify winning bidder
                $winningBid->user->notify(new WinningBidderNotification($this, $winningBid));
                Log::info('Sent notification to winning bidder', [
                    'user_id' => $winningBid->user_id,
                    'notification_type' => 'WinningBidderNotification'
                ]);
                
                // Notify seller
                $this->user->notify(new AuctionEndedNotification($this, $winningBid));
                Log::info('Sent notification to seller', [
                    'user_id' => $this->user_id,
                    'notification_type' => 'AuctionEndedNotification'
                ]);

                // Broadcast event
                broadcast(new AuctionEnded($this, $winningBid))->toOthers();
                Log::info('Broadcasted AuctionEnded event', [
                    'asset_id' => $this->id,
                    'winning_bid_id' => $winningBid->id
                ]);
            } else {
                // Notify seller that auction ended with no bids
                $this->user->notify(new AuctionEndedNotification($this, null));
                Log::info('Sent notification to seller (no winning bid)', [
                    'user_id' => $this->user_id,
                    'notification_type' => 'AuctionEndedNotification'
                ]);
                
                // Broadcast event
                broadcast(new AuctionEnded($this))->toOthers();
                Log::info('Broadcasted AuctionEnded event (no winning bid)', [
                    'asset_id' => $this->id
                ]);
            }

            Log::info('Successfully processed ended auction', [
                'asset_id' => $this->id,
                'winning_bid_id' => $winningBid ? $winningBid->id : null,
                'winning_bid_amount' => $winningBid ? $winningBid->amount : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing ended auction', [
                'asset_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function setStatusAttribute($value)
    {
        if ($value === 'ended' && $this->status !== 'ended') {
            $this->attributes['status'] = $value;
            $this->processEndedAuction();
        } else {
            $this->attributes['status'] = $value;
        }
    }
}