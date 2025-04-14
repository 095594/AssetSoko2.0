import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/inertia-react';

Pusher.log = function(msg) {
    console.log('Pusher Log:', msg);
};

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Listen for private user notifications
        const privateChannel = window.Echo.private(`private-user.${window.userId}`)
            .listen('.AuctionEndedBroadcast', (data) => {
                console.log('Received auction ended event:', data);
                
                let title;
                switch(data.type) {
                    case 'winner':
                        title = `You won the auction for ${data.asset.name}`;
                        break;
                    case 'outbid':
                        title = `Auction ended for ${data.asset.name}`;
                        break;
                    case 'seller':
                        title = data.winningBid 
                            ? `Your auction for ${data.asset.name} has ended with a winning bid`
                            : `Your auction for ${data.asset.name} ended with no bids`;
                        break;
                    default:
                        return;
                }

                const notification = {
                    id: Date.now(),
                    title,
                    type: data.type,
                    asset: data.asset,
                    winningBid: data.winningBid,
                    timestamp: new Date().toISOString()
                };

                setNotifications(prev => [notification, ...prev]);
            });

        return () => {
            window.Echo.leave(`private-user.${window.userId}`);
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="relative">
            <button 
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <span className="text-gray-700">🔔</span>
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="p-2 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        {notifications.length > 0 && (
                            <button 
                                onClick={clearNotifications}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className="p-3 border-b hover:bg-gray-50"
                                >
                                    <div className="font-medium">{notification.title}</div>
                                    {notification.winningBid && (
                                        <div className="text-sm text-gray-600">
                                            Winning bid: Ksh {notification.winningBid.amount}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTimestamp(notification.timestamp)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}