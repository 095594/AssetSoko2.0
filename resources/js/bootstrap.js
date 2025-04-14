import axios from "axios";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Get CSRF token from meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: import.meta.env.VITE_PUSHER_FORCETLS === 'true',
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': token || '',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }
});

// Configure Pusher debug logging
Pusher.logToConsole = true;

// Add connection monitoring
window.Echo.connector.pusher.connection.bind('state_change', function(states) {
    console.log('Pusher connection state changed:', states);
});

window.Echo.connector.pusher.connection.bind('connected', function() {
    console.log('Successfully connected to Pusher');
});

window.Echo.connector.pusher.connection.bind('error', function(err) {
    console.error('Pusher connection error:', err);
});

window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token || '';
