<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $mpesaService;

    public function __construct(MpesaService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
    }

    public function initiatePayment(Request $request, Asset $asset)
    {
        // Find the winning bid
        $winningBid = $asset->bids()
            ->where('status', 'accepted')
            ->latest()
            ->first();

        if (!$winningBid) {
            return back()->with('error', 'No winning bid found for this asset.');
        }

        // Create payment record
        $payment = Payment::create([
            'asset_id' => $asset->id,
            'bid_id' => $winningBid->id,
            'buyer_id' => $winningBid->user_id,
            'seller_id' => $asset->user_id,
            'amount' => $winningBid->amount,
            'payment_method' => $request->payment_method,
            'status' => 'pending'
        ]);

        // Handle different payment methods
        switch ($request->payment_method) {
            case 'mpesa':
                $result = $this->mpesaService->initiatePayment($payment);
                if ($result['success']) {
                    return back()->with('success', 'M-Pesa payment initiated. Please check your phone for the STK push.');
                }
                return back()->with('error', $result['message']);
                break;

            // Add other payment methods here
            default:
                return back()->with('error', 'Unsupported payment method.');
        }
    }

    public function mpesaCallback(Request $request)
    {
        $result = $this->mpesaService->handleCallback($request->all());
        
        if ($result) {
            return response()->json(['message' => 'Callback processed successfully']);
        }

        return response()->json(['message' => 'Failed to process callback'], 500);
    }

    public function showPaymentStatus(Asset $asset)
    {
        $payment = Payment::where('asset_id', $asset->id)
            ->with(['buyer', 'seller'])
            ->latest()
            ->first();

        return Inertia::render('Payments/Status', [
            'asset' => $asset,
            'payment' => $payment
        ]);
    }
} 