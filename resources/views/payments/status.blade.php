@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div class="mb-6">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        
        <h2 class="text-2xl font-bold mb-4">Processing Payment</h2>
        <p class="text-gray-600 mb-6">Please check your phone for the M-Pesa STK Push prompt. Once you complete the payment, this page will automatically update.</p>
        
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Payment Details</h3>
            <p class="text-gray-600">Asset: {{ $asset->name }}</p>
            <p class="text-gray-600">Amount: KES {{ number_format($payment->amount, 2) }}</p>
            <p class="text-gray-600">Phone: {{ $payment->phone_number }}</p>
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

@push('scripts')
<script>
    // Poll for payment status every 5 seconds
    function checkPaymentStatus() {
        fetch('{{ route('payments.status', $asset->id) }}')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'completed') {
                    window.location.href = '{{ route('payments.success', $asset->id) }}';
                } else if (data.status === 'failed') {
                    window.location.href = '{{ route('payments.create', $asset->id) }}';
                } else {
                    setTimeout(checkPaymentStatus, 5000);
                }
            })
            .catch(error => {
                console.error('Error checking payment status:', error);
                setTimeout(checkPaymentStatus, 5000);
            });
    }

    // Start polling when the page loads
    document.addEventListener('DOMContentLoaded', checkPaymentStatus);
</script>
@endpush
@endsection 