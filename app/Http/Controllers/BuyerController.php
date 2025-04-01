<?php

namespace App\Http\Controllers;
use App\Models\Auction;
use Inertia\Inertia;

use Illuminate\Http\Request;


class BuyerController extends Controller
{
    // public function index()
    // {
    //     $auctions = Auction::where('status', 'ongoing')->get();
    //     return Inertia::render('Buyer/Dashboard', ['auctions' => $auctions]);
    // }
    use Illuminate\Support\Facades\Auth;

public function getUserData()
{
    $user = Auth::user();
    
    // Default avatar URL
    $defaultAvatar = '/img/default-avatar.png';
    
    // If profile photo URL is empty, use the default avatar
    $profilePhotoUrl = $user->profile_photo_url ?: $defaultAvatar;

    return response()->json([
        'user' => [
            'name' => $user->name,
            'profile_photo_url' => $profilePhotoUrl,
            'theme' => $user->theme,
        ]
    ]);
}

}
