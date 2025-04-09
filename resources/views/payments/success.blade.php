@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div class="mb-6">
            <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        
        <h2 class="text-2xl font-bold mb-4">Payment Successful!</h2>
        <p class="text-gray-600 mb-6">Thank you for your payment. The asset is now yours.</p>
        
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Asset Details</h3>
            <p class="text-gray-600">Asset Name: {{ $asset->name }}</p>
            <p class="text-gray-600">Transaction ID: {{ $asset->payments->first()->transaction_id }}</p>
        </div>

        <div class="space-x-4">
            <a href="{{ route('assets.show', $asset->id) }}" 
               class="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                View Asset
            </a>
            <a href="{{ route('dashboard') }}" 
               class="inline-block bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                Go to Dashboard
            </a>
        </div>
    </div>
</div>
@endsection 