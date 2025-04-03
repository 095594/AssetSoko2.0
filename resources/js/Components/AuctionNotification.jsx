import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Link } from '@inertiajs/react';

export default function AuctionNotification({ auth }) {
    const [show, setShow] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!auth.user) return;

        // Subscribe to the user's private channel
        window.Echo.private(`user.${auth.user.id}`)
            .listen('AuctionCompleted', (e) => {
                setNotification(e);
                setShow(true);
            });

        return () => {
            window.Echo.leave(`user.${auth.user.id}`);
        };
    }, [auth.user]);

    const handleClose = () => {
        setShow(false);
        setNotification(null);
    };

    const handleProceedToPayment = () => {
        if (notification?.asset?.id) {
            window.location.href = route('payments.initiate', notification.asset.id);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Auction Won!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {notification && (
                    <>
                        <p>{notification.message}</p>
                        <div className="mt-3">
                            <strong>Asset Details:</strong>
                            <ul className="list-unstyled">
                                <li>Name: {notification.asset.name}</li>
                                <li>Winning Bid: ${notification.asset.price}</li>
                            </ul>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleProceedToPayment}>
                    Proceed to Payment
                </Button>
            </Modal.Footer>
        </Modal>
    );
} 