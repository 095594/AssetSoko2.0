<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->latest()
            ->paginate(10);

        // Transform notifications to include asset and bidder data
        $notifications->getCollection()->transform(function ($notification) {
            $data = $notification->data;
            
            // Get asset information
            if (isset($data['asset_id'])) {
                $asset = \App\Models\Asset::select('id', 'name', 'current_price', 'auction_end_time')
                    ->with(['user' => function($query) {
                        $query->select('id', 'name', 'company_name');
                    }])
                    ->find($data['asset_id']);
                $notification->asset = $asset;
            }

            // Get bidder information if it's a bid notification
            if (isset($data['bid_id'])) {
                $bid = \App\Models\Bid::select('id', 'user_id', 'amount')
                    ->with(['user' => function($query) {
                        $query->select('id', 'name', 'company_name');
                    }])
                    ->find($data['bid_id']);
                $notification->bid = $bid;
            }

            return $notification;
        });

        return Inertia::render('Buyer/Notifications/Index', [
            'notifications' => $notifications,
            'darkMode' => auth()->user()->dark_mode
        ]);
    }

    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return back();
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }
}