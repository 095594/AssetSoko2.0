import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable Pusher logging
Pusher.logToConsole = true;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

// Add connection status listeners
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('Pusher connected successfully!');
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('Pusher disconnected!');
});

window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('Pusher error:', err);
});

// Test connection by subscribing to a channel
window.Echo.channel('test-channel')
    .listen('TestEvent', (e) => {
        console.log('Test event received:', e);
    });