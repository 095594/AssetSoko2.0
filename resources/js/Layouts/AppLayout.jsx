import React from 'react';
import { usePage } from '@inertiajs/react';
import { ToastContainerComponent } from '@/Hooks/useToast';
import AuctionNotification from '@/Components/AuctionNotification';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                {/* Your existing navigation code */}
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Toast Container */}
            <ToastContainerComponent />

            {/* Auction Notification Modal */}
            <AuctionNotification auth={auth} />
        </div>
    );
} 