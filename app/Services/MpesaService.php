<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    private $consumerKey;
    private $consumerSecret;
    private $passkey;
    private $shortcode;
    private $callbackUrl;
    private $baseUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->callbackUrl = config('services.mpesa.callback_url');
        $this->baseUrl = config('services.mpesa.base_url');
    }

    public function initiatePayment(Payment $payment)
    {
        try {
            // Get access token
            $token = $this->getAccessToken();
            if (!$token) {
                throw new \Exception('Failed to get access token');
            }

            // Generate timestamp
            $timestamp = date('YmdHis');
            
            // Generate password
            $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

            // Prepare request data
            $data = [
                'BusinessShortCode' => $this->shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => (int) $payment->amount,
                'PartyA' => $payment->buyer->phone,
                'PartyB' => $this->shortcode,
                'PhoneNumber' => $payment->buyer->phone,
                'CallBackURL' => $this->callbackUrl,
                'AccountReference' => 'ASSET' . $payment->asset_id,
                'TransactionDesc' => 'Payment for ' . $payment->asset->name
            ];

            // Make API request
            $response = Http::withToken($token)
                ->post($this->baseUrl . '/mpesa/stkpush/v1/processrequest', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                // Update payment with checkout request ID
                $payment->update([
                    'payment_details' => [
                        'checkout_request_id' => $result['CheckoutRequestID'],
                        'merchant_request_id' => $result['MerchantRequestID']
                    ]
                ]);

                return [
                    'success' => true,
                    'checkout_request_id' => $result['CheckoutRequestID'],
                    'merchant_request_id' => $result['MerchantRequestID']
                ];
            }

            throw new \Exception('Failed to initiate M-Pesa payment: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('M-Pesa payment initiation failed: ' . $e->getMessage());
            $payment->markAsFailed(['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function handleCallback($data)
    {
        try {
            // Verify the callback data
            if (!$this->verifyCallback($data)) {
                throw new \Exception('Invalid callback data');
            }

            // Find the payment by checkout request ID
            $payment = Payment::where('payment_details->checkout_request_id', $data['CheckoutRequestID'])
                ->first();

            if (!$payment) {
                throw new \Exception('Payment not found');
            }

            // Update payment status based on result code
            if ($data['ResultCode'] === 0) {
                $payment->markAsCompleted($data['MpesaReceiptNumber'], [
                    'result_code' => $data['ResultCode'],
                    'result_desc' => $data['ResultDesc'],
                    'amount' => $data['Amount'],
                    'transaction_date' => $data['TransactionDate']
                ]);

                // Update asset status
                $payment->asset->update(['status' => 'sold']);
            } else {
                $payment->markAsFailed([
                    'result_code' => $data['ResultCode'],
                    'result_desc' => $data['ResultDesc']
                ]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('M-Pesa callback handling failed: ' . $e->getMessage());
            return false;
        }
    }

    private function getAccessToken()
    {
        try {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get($this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials');

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Failed to get M-Pesa access token: ' . $e->getMessage());
            return null;
        }
    }

    private function verifyCallback($data)
    {
        // Add your callback verification logic here
        // This should verify that the callback is actually from M-Pesa
        return true;
    }
} 