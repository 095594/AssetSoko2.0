import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Messages({ messages }) {
    const { data, setData, post, processing } = useForm({
        receiver_id: '',
        message: '',
        listing_id: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('messages.store'));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Head title="Messages" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Messages</h1>

                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="bg-gray-50 p-4 rounded-lg">
                                <p><strong>{message.sender.name}</strong>: {message.message}</p>
                                <p className="text-sm text-gray-500">{message.created_at}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm"
                            rows="3"
                            placeholder="Type your message..."
                        />
                        <button type="submit" disabled={processing} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
                            {processing ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}