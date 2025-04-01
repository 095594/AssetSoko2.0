<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Watchlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'asset_id',
    ];

    // Relationship: A watchlist entry belongs to a buyer (user)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: A watchlist entry belongs to an asset
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }
}