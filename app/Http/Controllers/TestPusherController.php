<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestPusherController extends Controller
{
    public function testConnection()
    {
        try {
            broadcast(new \App\Events\TestEvent());
            return response()->json(['message' => 'Test event broadcasted successfully']);
        } catch (\Exception $e) {
            Log::error('Pusher test failed:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
