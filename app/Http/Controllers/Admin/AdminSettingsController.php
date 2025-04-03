<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'site_name' => config('app.name'),
                'site_description' => config('app.description'),
                'contact_email' => config('mail.from.address'),
                'currency' => config('app.currency', 'USD'),
                'timezone' => config('app.timezone', 'UTC'),
            ]
        ]);
    }

    /**
     * Update the specified settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'contact_email' => 'required|email|max:255',
            'currency' => 'required|string|size:3',
            'timezone' => 'required|string|timezone',
        ]);

        // Here you would typically save these settings to your database or config files
        // For now, we'll just return a success message
        return back()->with('success', 'Settings updated successfully.');
    }
} 