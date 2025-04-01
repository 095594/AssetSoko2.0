<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'asset_id',
        'bid_id',
        'buyer_id',
        'seller_id',
        'amount',
        'payment_method',
        'status',
        'transaction_id',
        'payment_details',
        'paid_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'paid_at' => 'datetime'
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function bid(): BelongsTo
    {
        return $this->belongsTo(Bid::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function markAsCompleted(string $transactionId, array $details = []): bool
    {
        return $this->update([
            'status' => 'completed',
            'transaction_id' => $transactionId,
            'payment_details' => $details,
            'paid_at' => now()
        ]);
    }

    public function markAsFailed(array $details = []): bool
    {
        return $this->update([
            'status' => 'failed',
            'payment_details' => $details
        ]);
    }
} 