import React from 'react';
import { Head } from '@inertiajs/react';
import AuctionNotification from '@/Components/AuctionNotification';

export default function AppLayout({ children, auth }) {
    return (
        <>
            <Head title="AssetSoko" />
            {children}
            <AuctionNotification auth={auth} />
        </>
    );
} 