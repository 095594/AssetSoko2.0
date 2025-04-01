import React from 'react';
import { Link } from '@inertiajs/inertia-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-blue-900 mb-4">
                    Welcome to Asset Soko
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                    Your one-stop platform for corporate asset procurement and management.
                </p>
                <div className="space-x-4">
                    <Link
                        href="/login"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}