import React, { useEffect } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/inertia-react';

export default function AuctionProcessor() {
    const { auth } = usePage().props;

    useEffect(() => {
        const processAuctions = async () => {
            try {
                const response = await axios.post('/api/auctions/process-ended', {}, {
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'X-API-Key': process.env.MIX_API_KEY
                    }
                });
                
                console.log('Auction processing result:', response.data);
            } catch (error) {
                console.error('Error processing auctions:', error);
            }
        };

        // Process auctions immediately when component mounts
        processAuctions();

        // Set up interval to process auctions every minute
        const interval = setInterval(processAuctions, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [auth.token]);

    return null; // This component doesn't render anything
} 