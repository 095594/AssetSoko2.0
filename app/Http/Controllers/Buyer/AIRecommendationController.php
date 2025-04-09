<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Bid;
use App\Models\Watchlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AIRecommendationController extends Controller
{
    public function getRecommendations()
    {
        try {
            $user = auth()->user();
            
            // Get user's bidding history
            $biddingHistory = Bid::where('user_id', $user->id)
                ->with(['asset'])
                ->get();

            // Get user's watchlist
            $watchlist = Watchlist::where('user_id', $user->id)
                ->with(['asset'])
                ->get();

            // Analyze user preferences
            $preferredCategories = collect();
            $typicalPriceRange = [
                'min' => PHP_FLOAT_MAX,
                'max' => 0
            ];

            // Analyze bidding history
            foreach ($biddingHistory as $bid) {
                $preferredCategories->push($bid->asset->category);
                $typicalPriceRange['min'] = min($typicalPriceRange['min'], $bid->amount);
                $typicalPriceRange['max'] = max($typicalPriceRange['max'], $bid->amount);
            }

            // Analyze watchlist
            foreach ($watchlist as $item) {
                $preferredCategories->push($item->asset->category);
            }

            // Get unique categories and their counts
            $categoryPreferences = $preferredCategories->countBy();

            // Get base query for recommendations
            $query = Asset::where('status', 'active')
                ->where('auction_end_time', '>', now())
                ->whereDoesntHave('bids', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereDoesntHave('watchlist', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });

            // If we have preferred categories, filter by them
            if ($categoryPreferences->isNotEmpty()) {
                $query->whereIn('category', $categoryPreferences->keys()->toArray());
            }

            // Get recommendations
            $recommendations = $query->latest()
                ->take(5)
                ->get()
                ->map(function ($asset) use ($categoryPreferences) {
                    // Get the first image URL
                    $imageUrl = null;
                    if ($asset->photos) {
                        if (is_array($asset->photos)) {
                            $imageUrl = '/storage/' . $asset->photos[0];
                        } else {
                            $photos = json_decode($asset->photos, true);
                            if (is_array($photos) && !empty($photos)) {
                                $imageUrl = '/storage/' . $photos[0];
                            }
                        }
                    } elseif ($asset->image_url) {
                        if (str_starts_with($asset->image_url, 'http')) {
                            $imageUrl = $asset->image_url;
                        } else {
                            $imageUrl = '/storage/' . $asset->image_url;
                        }
                    }

                    // Determine recommendation reason
                    $reason = 'Popular item in your preferred categories';
                    if ($categoryPreferences->isNotEmpty() && isset($categoryPreferences[$asset->category])) {
                        $reason = "Based on your interest in {$asset->category}";
                    }

                    return [
                        'id' => $asset->id,
                        'name' => $asset->name,
                        'description' => $asset->description,
                        'current_price' => $asset->current_price,
                        'category' => $asset->category,
                        'auction_end_time' => $asset->auction_end_time,
                        'image_url' => $imageUrl,
                        'reason' => $reason
                    ];
                });

            // If no recommendations found, get popular active assets
            if ($recommendations->isEmpty()) {
                $recommendations = Asset::where('status', 'active')
                    ->where('auction_end_time', '>', now())
                    ->whereDoesntHave('bids', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->whereDoesntHave('watchlist', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($asset) {
                        // Get the first image URL
                        $imageUrl = null;
                        if ($asset->photos) {
                            if (is_array($asset->photos)) {
                                $imageUrl = '/storage/' . $asset->photos[0];
                            } else {
                                $photos = json_decode($asset->photos, true);
                                if (is_array($photos) && !empty($photos)) {
                                    $imageUrl = '/storage/' . $photos[0];
                                }
                            }
                        } elseif ($asset->image_url) {
                            if (str_starts_with($asset->image_url, 'http')) {
                                $imageUrl = $asset->image_url;
                            } else {
                                $imageUrl = '/storage/' . $asset->image_url;
                            }
                        }

                        return [
                            'id' => $asset->id,
                            'name' => $asset->name,
                            'description' => $asset->description,
                            'current_price' => $asset->current_price,
                            'category' => $asset->category,
                            'auction_end_time' => $asset->auction_end_time,
                            'image_url' => $imageUrl,
                            'reason' => 'Popular active asset'
                        ];
                    });
            }

            return response()->json($recommendations);
        } catch (\Exception $e) {
            Log::error('Error in getRecommendations: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get recommendations'], 500);
        }
    }

    private function generateRecommendationReason($asset, $user, $biddingCategories, $watchlistCategories)
    {
        if (in_array($asset->category, $biddingCategories)) {
            return "You've shown interest in {$asset->category} through your bidding history";
        }

        if (in_array($asset->category, $watchlistCategories)) {
            return "Matches your watchlist preferences in {$asset->category}";
        }

        // Get user's typical bidding range
        $userBids = Bid::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        if ($userBids->isNotEmpty()) {
            $avgBid = $userBids->avg('amount');
            if ($asset->current_price && abs($asset->current_price - $avgBid) < ($avgBid * 0.2)) {
                return "Fits within your typical bidding range";
            }
        }

        return "Recommended based on popular items in {$asset->category}";
    }
} 