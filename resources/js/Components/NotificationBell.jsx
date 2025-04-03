import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/inertia-react';

Pusher.log = function(msg) {
    console.log('Pusher Log:', msg);
};

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        window.Echo.private(`notifications.${auth.user.id}`)
            .listen('NewNotification', (notification) => {
                setNotifications((prev) => [notification, ...prev]);
            });

        return () => {
            window.Echo.leave(`notifications.${auth.user.id}`);
        };
    }, []);

    return (
        <div className="relative">
            <button className="p-2 bg-gray-200 rounded-full">
                <span className="text-gray-700">🔔</span>
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                        {notifications.length}
                    </span>
                )}
            </button>
        </div>
    );
}