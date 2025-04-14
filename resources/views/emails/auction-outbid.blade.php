@component('mail::message')
# Auction Has Ended

Hello {{ $user->name }},

The auction for **{{ $asset->name }}** that you participated in has ended.

## Final Results
- **Item:** {{ $asset->name }}
- **Final Winning Bid:** KES {{ number_format($winningBid->amount, 2) }}
- **Auction End Time:** {{ $asset->auction_end_time->format('F j, Y g:i a') }}

While you weren't the winning bidder this time, we encourage you to check out our other active auctions. There are many more great opportunities available!

@component('mail::button', ['url' => route('assets.index')])
View More Auctions
@endcomponent

Thank you for participating in our auction. We look forward to seeing your bids in future auctions!

Thanks,<br>
{{ config('app.name') }}
@endcomponent
