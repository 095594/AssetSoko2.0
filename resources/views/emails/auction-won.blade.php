@component('mail::message')
# Congratulations! You Won the Auction

Hello {{ $user->name }},

You have successfully won the auction for **{{ $asset->name }}**!

## Auction Details
- **Item:** {{ $asset->name }}
- **Your Winning Bid:** KES {{ number_format($winningBid->amount, 2) }}
- **Auction End Time:** {{ $asset->auction_end_time->format('F j, Y g:i a') }}

## Next Steps
Please complete your payment within the next 24 hours to secure your purchase. After payment, the seller will be notified and will begin processing your order.

@component('mail::button', ['url' => $winningBid->payment_url])
Complete Payment Now
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact our support team.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
