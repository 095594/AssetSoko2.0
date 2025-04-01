<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Settings/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'dark_mode' => $user->dark_mode ?? false,
                'email_notifications' => $user->email_notifications ?? true,
                'bid_notifications' => $user->bid_notifications ?? true,
                'auction_notifications' => $user->auction_notifications ?? true,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'dark_mode' => 'boolean',
            'email_notifications' => 'boolean',
            'bid_notifications' => 'boolean',
            'auction_notifications' => 'boolean',
        ]);

        $user->update($validated);

        return back()->with('success', 'Settings updated successfully.');
    }
} 