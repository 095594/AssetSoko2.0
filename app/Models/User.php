<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'is_admin',
        'dark_mode',
        'email_notifications',
        'bid_notifications',
        'auction_notifications',
        'company_name',
        'phone',
        'address',
        'last_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'dark_mode' => 'boolean',
        'email_notifications' => 'boolean',
        'bid_notifications' => 'boolean',
        'auction_notifications' => 'boolean',
        'last_active' => 'datetime',
    ];

    // ... rest of your model code ...

    // Relationship with assets (for sellers)
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'seller_id');
    }

    // Relationship with bids (for buyers)
    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    // Relationship with watchlist (for buyers)
    public function watchlist(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'watchlists')
            ->withTimestamps();
    }

    // Relationship with orders (for buyers)
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    // Relationship with sales (for sellers)
    public function sales(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    // Relationship with asset views
    public function assetViews(): HasMany
    {
        return $this->hasMany(AssetView::class);
    }

    // Check if user is admin
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    // Check if user has assets
    public function hasAssets(): bool
    {
        return $this->assets()->exists();
    }

    // Check if user has bids
    public function hasBids(): bool
    {
        return $this->bids()->exists();
    }

    // Check if user is active
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Update user's last active timestamp
    public function updateLastActive(): void
    {
        \Log::info('Updating last_active for user ' . $this->id . ' to ' . now());
        $this->last_active = now();
        $this->save();
        \Log::info('Updated last_active for user ' . $this->id . ' to ' . $this->last_active);
    }

    public function getLastActiveAttribute($value)
    {
        return $value ? Carbon::parse($value) : null;
    }
}