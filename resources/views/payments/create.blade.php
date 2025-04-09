@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-6">Complete Your Payment</h2>
        
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Asset Details</h3>
            <p class="text-gray-600">Asset Name: {{ $asset->name }}</p>
            <p class="text-gray-600">Amount to Pay: KES {{ number_format($winningBid->amount, 2) }}</p>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-4">Choose Payment Method</h3>
            
            <div class="space-y-4">
                <!-- Stripe Payment -->
                <div class="border rounded-lg p-4">
                    <h4 class="font-semibold mb-2">Pay with Card (Stripe)</h4>
                    <form id="stripe-form" class="space-y-4">
                        @csrf
                        <div id="stripe-card-element" class="p-3 border rounded"></div>
                        <div id="stripe-card-errors" class="text-red-500 text-sm mt-2"></div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            Pay with Card
                        </button>
                    </form>
                </div>

                <!-- M-Pesa Payment -->
                <div class="border rounded-lg p-4">
                    <h4 class="font-semibold mb-2">Pay with M-Pesa</h4>
                    <form id="mpesa-form" class="space-y-4">
                        @csrf
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="phone">
                                M-Pesa Phone Number
                            </label>
                            <input type="tel" id="phone" name="phone" 
                                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                placeholder="e.g., 254700000000" required>
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                            Pay with M-Pesa
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('{{ config('services.stripe.key') }}');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#stripe-card-element');

    // Handle Stripe form submission
    const stripeForm = document.getElementById('stripe-form');
    stripeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });

        if (error) {
            document.getElementById('stripe-card-errors').textContent = error.message;
            return;
        }

        try {
            const response = await fetch('{{ route('payments.stripe', $asset->id) }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({
                    payment_method: paymentMethod.id,
                    amount: {{ $winningBid->amount }}
                })
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = result.redirect;
            } else {
                document.getElementById('stripe-card-errors').textContent = result.message;
            }
        } catch (error) {
            document.getElementById('stripe-card-errors').textContent = 'An error occurred. Please try again.';
        }
    });

    // Handle M-Pesa form submission
    const mpesaForm = document.getElementById('mpesa-form');
    mpesaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('{{ route('payments.mpesa', $asset->id) }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({
                    phone: document.getElementById('phone').value
                })
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = result.redirect;
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    });
</script>
@endpush
@endsection 