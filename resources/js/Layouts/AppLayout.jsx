import React from 'react';
import { usePage } from '@inertiajs/react';
import { ToastContainerComponent } from '@/Hooks/useToast';
import AuctionNotification from '@/Components/AuctionNotification';
import AuctionListener from '@/Components/AuctionListener';
import AuctionProcessor from '@/Components/AuctionProcessor';
import NotificationBell from '@/Components/NotificationBell';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <a href="/" className="text-xl font-bold text-gray-800">
                                    AssetSoko
                                </a>
                            </div>
                        </div>

                        {/* Right side navigation items */}
                        <div className="flex items-center space-x-4">
                            {auth.user && <NotificationBell />}
                            {/* Add other navigation items here */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Toast Container */}
            <ToastContainerComponent />

            {/* Auction Notification Modal */}
            <AuctionNotification auth={auth} />

            {/* Auction Event Listener */}
            {auth.user && <AuctionListener userId={auth.user.id} />}

            {/* Auction Processor */}
            <AuctionProcessor />
        </div>
    );
}