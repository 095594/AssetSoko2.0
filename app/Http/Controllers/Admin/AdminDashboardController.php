<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\Asset;
use App\Models\ActivityLog;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalAssets = Asset::count();
        $totalTransactions = Order::count();
        $recentActivities = ActivityLog::latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => $totalUsers,
            'totalAssets' => $totalAssets,
            'totalTransactions' => $totalTransactions,
            'recentActivities' => $recentActivities,
        ]);
    }
}
