import React from 'react';
import { Head, Link } from '@inertiajs/inertia-react';

export default function ActiveListings({ auth, listings }) {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Head title="Active Listings" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Active Listings</h1>

                    <div className="space-y-4">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold">{listing.title}</h2>
                                <p className="text-gray-600">{listing.description}</p>
                                <p className="text-gray-600">Current Bid: Ksh {listing.current_bid}</p>
                                <p className="text-gray-600">Time Remaining: {listing.time_remaining}</p>

                                <div className="mt-4 flex space-x-4">
                                    <Link href={route('listings.edit', listing.id)} className="bg-yellow-500 text-white px-4 py-2 rounded-md">
                                        Edit
                                    </Link>
                                    <Link href={route('listings.markAsSold', listing.id)} className="bg-green-500 text-white px-4 py-2 rounded-md">
                                        Mark as Sold
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}