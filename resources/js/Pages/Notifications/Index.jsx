import React from 'react';
import { Head, Link } from '@inertiajs/inertia-react';

export default function Notifications({ notifications }) {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Head title="Notifications" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Notifications</h1>

                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="bg-gray-50 p-4 rounded-lg">
                                <p>{notification.message}</p>
                                <p className="text-sm text-gray-500">{notification.created_at}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}