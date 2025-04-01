<!DOCTYPE html>
<html>
<head>
    <title>Congratulations! You Won the Auction</title>
</head>
<body>
    <h2>🎉 Congratulations, {{ $user->name }}!</h2>

    <p>You have won the auction for <strong>{{ $asset->name }}</strong>.</p>
    <p>Your final bid: <strong>Ksh {{ number_format($winningBid->amount, 2) }}</strong></p>
    
    <p>Please proceed with the payment to claim your asset.</p>

    <a href="{{ url('/checkout/' . $winningBid->id) }}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px;">
        Complete Payment 💳
    </a>

    <p>Thank you for using Asset Soko!</p>
</body>
</html>
