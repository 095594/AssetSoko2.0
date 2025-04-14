@component('mail::message')
# Congratulations! You Won the Auction

You have successfully won the auction for **{{ $asset->name }}** with your bid of **KES {{ number_format($bid->amount, 2) }}**.

## Next Steps
1. Complete your payment within 24 hours to secure your purchase
2. After payment, the seller will be notified to arrange for delivery
3. Once delivered, you'll need to confirm receipt to release payment to the seller

@component('mail::button', ['url' => route('buyer.payments.initiate', $asset->id)])
Complete Payment Now
@endcomponent

## Asset Details
- **Name:** {{ $asset->name }}
- **Description:** {{ $asset->description }}
- **Winning Bid:** KES {{ number_format($bid->amount, 2) }}
- **Seller:** {{ $asset->seller->name }}

If you have any questions, please contact our support team.

Thanks,<br>
{{ config('app.name') }}
@endcomponent 