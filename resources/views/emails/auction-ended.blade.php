@component('mail::message')
# Your Auction Has Ended

Hello {{ $asset->user->name }},

Your auction for **{{ $asset->name }}** has ended.

@if($winningBid)
## Winning Bid Details
- **Winning Bidder:** {{ $winningBid->user->name }}
- **Winning Amount:** KES {{ number_format($winningBid->amount, 2) }}
- **Auction End Time:** {{ $asset->auction_end_time->format('F j, Y g:i a') }}

The winning bidder has been notified and will be required to complete their payment within 24 hours. You will receive another notification once the payment is completed.

@else
## No Winning Bids
Unfortunately, there were no winning bids for your auction. The item has been marked as unsold.

You can relist the item or modify the auction details if you'd like to try again.
@endif

@component('mail::button', ['url' => route('assets.show', $asset->id)])
View Auction Details
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent 