<?php

namespace App\Models;

use App\Events\BidPlaced; // Import the event
use App\Events\BidUpdated; // Ensure this event exists, or remove if not needed
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'asset_id', 'amount'];
    protected $dispatchesEvents = [
        'created' => BidPlaced::class,
        'updated' => BidUpdated::class,
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bidder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
