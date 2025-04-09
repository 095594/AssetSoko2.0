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

            // Get bid information
            if (isset($data['bid_amount'])) {
                $notification->bid = (object)[
                    'amount' => $data['bid_amount'],
                    'user' => isset($data['bidder_name']) ? (object)[
                        'name' => $data['bidder_name'],
                        'company_name' => $data['bidder_company_name'] ?? null
                    ] : null
                ];
            } else if (isset($data['winning_bid'])) {
                $notification->bid = (object)[
                    'amount' => $data['winning_bid']
                ];
            }

            // Ensure message is set
            if (!isset($data['message']) && isset($data['asset_name'])) {
                $data['message'] = "Notification about {$data['asset_name']}";
            }
            
            $notification->data = $data;
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