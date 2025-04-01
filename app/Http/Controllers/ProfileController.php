<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; // Import the correct Request class
use App\Http\Requests\ProfileUpdateRequest; // Import the custom request class
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;


class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        \Log::info('Profile edit method called', ['user' => $request->user()]);
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => [
                'name' => $request->user()->name,
                'profile_photo_url' => $request->user()->profile_picture 
                ? asset('storage/' . $request->user()->profile_picture) // Full URL for image
                : asset('img/default-avatar.png'), // Default avatar if null/ Use computed accessor
            ]
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        \Log::info('Profile update request data:', $request->all()); // Log request data
    
        $user = $request->user();
    
        // Update profile picture if provided
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $user->profile_picture = $path;// This ensures proper retrieval
        }
    
        // Update theme preference
        $user->theme = $request->input('theme');
    
        // Update other fields
        $user->fill($request->validated());
    
        // Reset email verification if email is changed
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
    
        // Save changes
        $user->save();
    
        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
    public function updateTheme(Request $request)
{
    $request->validate([
        'dark_mode' => 'required|boolean',
    ]);

    auth()->user()->update([
        'dark_mode' => $request->dark_mode,
    ]);

    return back()->with('status', 'Theme preference updated.');
}
}