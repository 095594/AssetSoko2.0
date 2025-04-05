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
            } else if (isset($data['asset_name'])) {
                // For notifications that have asset_name but not asset_id
                $notification->asset = (object)[
                    'id' => $data['asset_id'] ?? null,
                    'name' => $data['asset_name'] ?? 'Unknown Asset'
                ];
            }

            // Get bidder information if it's a bid notification
            if (isset($data['bid_id'])) {
                $bid = \App\Models\Bid::select('id', 'user_id', 'amount')
                    ->with(['user' => function($query) {
                        $query->select('id', 'name', 'company_name');
                    }])
                    ->find($data['bid_id']);
                $notification->bid = $bid;
            } else if (isset($data['bid_amount'])) {
                // For notifications that have bid_amount but not bid_id
                $notification->bid = (object)[
                    'id' => $data['bid_id'] ?? null,
                    'amount' => $data['bid_amount'] ?? 0,
                    'user' => isset($data['bidder_name']) ? (object)[
                        'name' => $data['bidder_name'],
                        'company_name' => $data['bidder_company_name'] ?? null
                    ] : null
                ];
            } else if (isset($data['winning_bid_amount'])) {
                // For auction won notifications
                $notification->bid = (object)[
                    'amount' => $data['winning_bid_amount'] ?? 0
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