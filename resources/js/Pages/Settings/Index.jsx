import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiMoon, FiSun, FiBell, FiMail, FiDollarSign } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Settings = ({ user }) => {
    const { data, setData, post, processing, errors } = useForm({
        dark_mode: user.dark_mode,
        email_notifications: user.email_notifications,
        bid_notifications: user.bid_notifications,
        auction_notifications: user.auction_notifications,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            onSuccess: () => {
                toast.success('Settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update settings.');
            },
        });
    };

    return (
        <BuyerLayout>
            <Head title="Settings" />
            <Container className="mt-4">
                <ToastContainer />
                
                <h3 className="mb-4">Settings</h3>

                <Card className="shadow-sm">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            {/* Appearance Settings */}
                            <div className="mb-4">
                                <h5 className="mb-3">Appearance</h5>
                                <Form.Check
                                    type="switch"
                                    id="dark-mode"
                                    label={
                                        <div className="d-flex align-items-center">
                                            {data.dark_mode ? <FiMoon className="me-2" /> : <FiSun className="me-2" />}
                                            Dark Mode
                                        </div>
                                    }
                                    checked={data.dark_mode}
                                    onChange={e => setData('dark_mode', e.target.checked)}
                                />
                            </div>

                            {/* Notification Settings */}
                            <div className="mb-4">
                                <h5 className="mb-3">Notifications</h5>
                                <Form.Check
                                    type="switch"
                                    id="email-notifications"
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FiMail className="me-2" />
                                            Email Notifications
                                        </div>
                                    }
                                    checked={data.email_notifications}
                                    onChange={e => setData('email_notifications', e.target.checked)}
                                />
                                <Form.Check
                                    type="switch"
                                    id="bid-notifications"
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FiDollarSign className="me-2" />
                                            Bid Notifications
                                        </div>
                                    }
                                    checked={data.bid_notifications}
                                    onChange={e => setData('bid_notifications', e.target.checked)}
                                />
                                <Form.Check
                                    type="switch"
                                    id="auction-notifications"
                                    label={
                                        <div className="d-flex align-items-center">
                                            <FiBell className="me-2" />
                                            Auction Notifications
                                        </div>
                                    }
                                    checked={data.auction_notifications}
                                    onChange={e => setData('auction_notifications', e.target.checked)}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={processing}
                                className="mt-3"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </BuyerLayout>
    );
};

export default Settings; 