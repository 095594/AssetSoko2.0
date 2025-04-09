<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Bid;
use App\Models\Payment;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $mpesaService;

    public function __construct(MpesaService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
        Stripe::setApiKey(config('services.stripe.secret'));
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

        // Check if payment already exists
        $existingPayment = Payment::where('asset_id', $asset->id)
            ->where('bid_id', $winningBid->id)
            ->first();

        if ($existingPayment) {
            // If payment exists but is pending, use it
            if ($existingPayment->status === 'pending') {
                $payment = $existingPayment;
            } else {
                return back()->with('error', 'Payment has already been processed for this asset.');
            }
        } else {
            // Create payment record
            $payment = Payment::create([
                'asset_id' => $asset->id,
                'bid_id' => $winningBid->id,
                'buyer_id' => $winningBid->user_id,
                'seller_id' => $asset->user_id,
                'amount' => $winningBid->amount,
                'payment_method' => $request->payment_method ?? 'pending',
                'status' => 'pending'
            ]);
        }

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
        try {
            $result = $this->mpesaService->handleCallback($request->all());
            
            if ($result) {
                return response()->json(['message' => 'Callback processed successfully']);
            }

            return response()->json(['message' => 'Failed to process callback'], 500);
        } catch (\Exception $e) {
            Log::error('M-Pesa callback error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing callback'], 500);
        }
    }

    public function showPaymentStatus(Asset $asset)
    {
        $payment = Payment::where('asset_id', $asset->id)
            ->where('buyer_id', Auth::id())
            ->with(['asset', 'buyer', 'seller'])
            ->latest()
            ->firstOrFail();

        return Inertia::render('Payments/Status', [
            'payment' => $payment,
            'asset' => $asset
        ]);
    }

    public function showPaymentForm(Asset $asset)
    {
        // Find the winning bid
        $winningBid = $asset->bids()
            ->where('status', 'won')
            ->latest()
            ->first();

        if (!$winningBid) {
            return redirect()->route('buyer.dashboard')
                ->with('error', 'No winning bid found for this asset.');
        }

        // Check if payment already exists
        $payment = Payment::where('asset_id', $asset->id)
            ->where('bid_id', $winningBid->id)
            ->first();

        if (!$payment) {
            // Create payment record if it doesn't exist
            $payment = Payment::create([
                'asset_id' => $asset->id,
                'bid_id' => $winningBid->id,
                'buyer_id' => $winningBid->user_id,
                'seller_id' => $asset->user_id,
                'amount' => $winningBid->amount,
                'status' => 'pending'
            ]);
        }

        // Check if user is authorized to make payment
        if (Auth::id() !== $winningBid->user_id) {
            return redirect()->route('buyer.dashboard')
                ->with('error', 'You are not authorized to make this payment.');
        }

        // Create a PaymentIntent
        $intent = PaymentIntent::create([
            'amount' => $payment->amount * 100, // Convert to cents
            'currency' => 'usd',
            'payment_method_types' => ['card'],
        ]);

        return Inertia::render('Payments/Create', [
            'asset' => $asset,
            'payment' => $payment,
            'stripeKey' => config('services.stripe.key'),
            'clientSecret' => $intent->client_secret,
        ]);
    }

    public function processStripePayment(Request $request, Asset $asset)
    {
        try {
            $payment = Payment::where('asset_id', $asset->id)
                ->where('buyer_id', Auth::id())
                ->where('status', 'pending')
                ->firstOrFail();

            // Confirm the payment
            $intent = PaymentIntent::retrieve($request->payment_intent);
            $intent->confirm();

            if ($intent->status === 'succeeded') {
                $payment->update([
                    'status' => 'completed',
                    'payment_method' => 'stripe',
                    'payment_details' => json_encode([
                        'payment_intent_id' => $intent->id,
                        'amount_received' => $intent->amount_received,
                        'currency' => $intent->currency,
                        'status' => $intent->status
                    ])
                ]);

                // Notify the seller
                $payment->seller->notify(new \App\Notifications\PaymentReceived($payment));
                
                // Notify the buyer
                $payment->buyer->notify(new \App\Notifications\PaymentSuccessful($payment));

                return redirect()->route('payments.success', $asset)
                    ->with('success', 'Payment processed successfully!');
            }

            return back()->with('error', 'Payment failed. Please try again.');
        } catch (\Exception $e) {
            Log::error('Stripe payment error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while processing your payment.');
        }
    }

    public function processMpesaPayment(Request $request, Asset $asset)
    {
        try {
            $payment = Payment::where('asset_id', $asset->id)
                ->where('buyer_id', Auth::id())
                ->where('status', 'pending')
                ->firstOrFail();

            $result = $this->mpesaService->initiatePayment($payment);

            if ($result['success']) {
                return redirect()->route('payments.status', $asset)
                    ->with('success', 'M-Pesa payment initiated. Please check your phone for the STK push.');
            }

            return back()->with('error', $result['message']);
        } catch (\Exception $e) {
            Log::error('M-Pesa payment error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while initiating the payment.');
        }
    }

    public function paymentSuccess(Asset $asset)
    {
        $payment = Payment::where('asset_id', $asset->id)
            ->where('buyer_id', Auth::id())
            ->where('status', 'completed')
            ->with(['asset', 'buyer', 'seller'])
            ->latest()
            ->firstOrFail();

        return Inertia::render('Payments/Success', [
            'payment' => $payment,
            'asset' => $asset
        ]);
    }
} 