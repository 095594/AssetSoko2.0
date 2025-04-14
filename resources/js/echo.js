import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable Pusher logging
Pusher.logToConsole = true;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
    },
    enableStats: false,
});

// Test connection
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('Pusher connected successfully!');
    
    // Subscribe to channels after connection is established
    const auctionsChannel = window.Echo.channel('auctions');
    
    // Handle subscription success with proper callback
    auctionsChannel.listen('pusher:subscription_succeeded', (data) => {
        console.log('Successfully subscribed to auctions channel:', data);
    });

    // Listen for auction ended events on the public channel
    auctionsChannel.listen('.AuctionEndedBroadcast', (e) => {
        console.log('Auction ended event received on public channel:', e);
    });

    // Subscribe to private channels for the authenticated user
    if (window.userId) {
        const privateChannel = window.Echo.private(`private-user.${window.userId}`);
        
        privateChannel.listen('.AuctionEndedBroadcast', (event) => {
            console.log('Received private auction notification:', event);
            
            // Dispatch custom events for different notification types
            if (event.type === 'winner') {
                window.dispatchEvent(new CustomEvent('auction-notification', {
                    detail: {
                        type: 'winner',
                        asset: event.asset,
                        winningBid: event.winningBid
                    }
                }));
            } else if (event.type === 'seller') {
                window.dispatchEvent(new CustomEvent('auction-notification', {
                    detail: {
                        type: 'seller',
                        asset: event.asset,
                        winningBid: event.winningBid
                    }
                }));
            } else if (event.type === 'outbid') {
                window.dispatchEvent(new CustomEvent('auction-notification', {
                    detail: {
                        type: 'outbid',
                        asset: event.asset
                    }
                }));
            }
        });

        privateChannel.subscribed(() => {
            console.log(`Successfully subscribed to private channel: private-user.${window.userId}`);
        });

        privateChannel.error((error) => {
            console.error('Private channel subscription error:', error);
        });
    }
});

// Handle disconnection
window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('Pusher disconnected!');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
        window.Echo.connector.pusher.connect();
    }, 5000);
});

// Handle errors
window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('Pusher error:', err);
});