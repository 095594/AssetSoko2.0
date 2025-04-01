<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->with(['asset'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Buyer/Notifications/Index', [
            'notifications' => $notifications,
            'darkMode' => auth()->user()->dark_mode,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->noContent();
    }

    public function markAllAsRead()
    {
        auth()->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }
}