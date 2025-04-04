<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Notifications\AssetNotification;
use Carbon\Carbon;

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
        'photos' => 'array'
    ];

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
        return $this->hasMany(Watchlist::class);
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
        // When retrieving from database (UTC), convert to local time
        return $value ? Carbon::parse($value)->setTimezone(config('app.timezone')) : null;
    }

    protected function setAuctionEndTimeAttribute($value)
    {
        // When saving to database, convert from local time to UTC
        $this->attributes['auction_end_time'] = $value ? Carbon::parse($value)->setTimezone('UTC') : null;
    }
}