import '../css/app.css';
import '../css/layout.css';
import './bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Ensure Bootstrap JS is loaded
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from 'react';
import { AuctionNotificationProvider } from './contexts/AuctionNotificationContext';

// Add <ToastContainer /> to your root component

const appName = import.meta.env.VITE_APP_NAME || 'Asset Soko';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Make user ID available globally for Pusher authentication
        if (props.initialPage.props.auth?.user?.id) {
            window.userId = props.initialPage.props.auth.user.id;
        }

        root.render(
            <AuctionNotificationProvider>
                <App {...props} />
                <ToastContainer />
            </AuctionNotificationProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
