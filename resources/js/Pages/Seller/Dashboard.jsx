import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, listings, notifications, metrics }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Seller Dashboard" />

            {/* Sidebar */}
            <div className={`absolute md:fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Asset Soko</h1>
                </div>
                <nav className="mt-6">
                    <Link href={route('seller.dashboard')} className="block px-6 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
                    <Link href={route('seller.listings')} className="block px-6 py-2 text-gray-700 hover:bg-gray-100">Listings</Link>
                    <Link href={route('seller.notifications')} className="block px-6 py-2 text-gray-700 hover:bg-gray-100">Notifications</Link>
                    <Link href={route('seller.messages')} className="block px-6 py-2 text-gray-700 hover:bg-gray-100">Messages</Link>
                    <Link href={route('seller.profile')} className="block px-6 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-gray-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <button className="relative p-2 bg-gray-200 rounded-full">
                            <span className="text-gray-700">🔔</span>
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2">
                                <img
                                    src={auth.user.profile_picture || 'https://via.placeholder.com/40'}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full"
                                />
                                <span>{auth.user.name}</span>
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg transition-opacity duration-200 ease-in-out opacity-100">
                                    <Link href={route('seller.profile')} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                    <Link href={route('logout')} method="post" as="button" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold">Total Listings</h2>
                        <p className="text-2xl">{metrics.totalListings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold">Active Auctions</h2>
                        <p className="text-2xl">{metrics.activeAuctions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold">Pending Bids</h2>
                        <p className="text-2xl">{metrics.pendingBids}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold">Completed Sales</h2>
                        <p className="text-2xl">{metrics.completedSales}</p>
                    </div>
                </div>

                {/* Active Listings */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold mb-4">Active Listings</h2>
                    <div className="space-y-4">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold">{listing.title}</h3>
                                <p className="text-gray-600">{listing.description}</p>
                                <p className="text-gray-600">Current Bid: Ksh {listing.current_bid}</p>
                                <p className="text-gray-600">Time Remaining: {listing.time_remaining}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
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