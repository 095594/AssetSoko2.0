<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $assets = Asset::where('user_id', auth()->id())->get();
        return Inertia::render('Seller/Dashboard', ['assets' => $assets]);
    }
}
