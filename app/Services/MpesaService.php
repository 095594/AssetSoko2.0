<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use Carbon\Carbon;

class MpesaService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $passkey;
    protected $shortcode;
    protected $environment;
    protected $baseUrl;
    protected $callbackUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->environment = config('services.mpesa.environment');
        $this->baseUrl = config('services.mpesa.base_url');
        $this->callbackUrl = config('services.mpesa.callback_url');
    }

    public function getAccessToken()
    {
        try {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get($this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials');

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            Log::error('M-Pesa Access Token Error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('M-Pesa Access Token Exception: ' . $e->getMessage());
            return null;
        }
    }

    public function initiatePayment(Payment $payment)
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return [
                'success' => false,
                'message' => 'Failed to get access token'
            ];
        }

        $timestamp = date('YmdHis');
        $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

        try {
            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . '/mpesa/stkpush/v1/processrequest', [
                    'BusinessShortCode' => $this->shortcode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $payment->amount,
                    'PartyA' => $payment->buyer->phone_number,
                    'PartyB' => $this->shortcode,
                    'PhoneNumber' => $payment->buyer->phone_number,
                    'CallBackURL' => $this->callbackUrl,
                    'AccountReference' => 'AssetSoko-' . $payment->id,
                    'TransactionDesc' => 'Payment for Asset: ' . $payment->asset->name
                ]);

            if ($response->successful()) {
                $result = $response->json();
                if ($result['ResponseCode'] == '0') {
                    $payment->update([
                        'payment_details' => json_encode([
                            'merchant_request_id' => $result['MerchantRequestID'],
                            'checkout_request_id' => $result['CheckoutRequestID'],
                            'response_code' => $result['ResponseCode'],
                            'response_description' => $result['ResponseDescription']
                        ])
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Payment initiated successfully'
                    ];
                }
            }

            Log::error('M-Pesa Payment Initiation Error: ' . $response->body());
            return [
                'success' => false,
                'message' => 'Failed to initiate payment'
            ];
        } catch (\Exception $e) {
            Log::error('M-Pesa Payment Initiation Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while initiating payment'
            ];
        }
    }

    public function handleCallback($data)
    {
        try {
            $result = $data['Body']['stkCallback'];
            $merchantRequestID = $result['MerchantRequestID'];
            $checkoutRequestID = $result['CheckoutRequestID'];
            $resultCode = $result['ResultCode'];
            $resultDesc = $result['ResultDesc'];

            // Find the payment record
            $payment = Payment::where('payment_details->merchant_request_id', $merchantRequestID)
                ->where('payment_details->checkout_request_id', $checkoutRequestID)
                ->first();

            if (!$payment) {
                Log::error('M-Pesa Callback: Payment record not found');
                return false;
            }

            if ($resultCode == 0) {
                // Payment successful
                $payment->update([
                    'status' => 'completed',
                    'payment_method' => 'mpesa',
                    'payment_details' => array_merge(
                        json_decode($payment->payment_details, true),
                        [
                            'result_code' => $resultCode,
                            'result_desc' => $resultDesc,
                            'callback_data' => $result
                        ]
                    )
                ]);

                // Notify the seller
                $payment->seller->notify(new \App\Notifications\PaymentReceived($payment));
                
                // Notify the buyer
                $payment->buyer->notify(new \App\Notifications\PaymentSuccessful($payment));

                return true;
            } else {
                // Payment failed
                $payment->update([
                    'status' => 'failed',
                    'payment_details' => array_merge(
                        json_decode($payment->payment_details, true),
                        [
                            'result_code' => $resultCode,
                            'result_desc' => $resultDesc,
                            'callback_data' => $result
                        ]
                    )
                ]);

                // Notify the buyer
                $payment->buyer->notify(new \App\Notifications\PaymentFailed($payment));

                return false;
            }
        } catch (\Exception $e) {
            Log::error('M-Pesa Callback Exception: ' . $e->getMessage());
            return false;
        }
    }
} 