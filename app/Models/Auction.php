<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'category', 'description', 'starting_price',
        'bid_increment', 'end_time', 'status', 'winner_id',
    ];
    protected $dispatchesEvents = [
        'updated' => AuctionEnded::class,
    ];

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function watchers()
    {
        return $this->belongsToMany(User::class, 'watchlist');
    }
}
