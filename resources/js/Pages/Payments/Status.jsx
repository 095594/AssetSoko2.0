import React from 'react';
import { Head } from '@inertiajs/react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

export default function PaymentStatus({ asset, payment }) {
    const getPaymentStatus = () => {
        switch (payment?.status) {
            case 'completed':
                return {
                    variant: 'success',
                    icon: <FiCheckCircle className="me-2" />,
                    message: 'Payment completed successfully!'
                };
            case 'pending':
                return {
                    variant: 'warning',
                    icon: <FiClock className="me-2" />,
                    message: 'Payment is pending. Please complete the payment process.'
                };
            case 'failed':
                return {
                    variant: 'danger',
                    icon: <FiAlertCircle className="me-2" />,
                    message: 'Payment failed. Please try again.'
                };
            default:
                return {
                    variant: 'info',
                    icon: <FiClock className="me-2" />,
                    message: 'Payment status unknown.'
                };
        }
    };

    const status = getPaymentStatus();

    return (
        <>
            <Head title="Payment Status" />
            <Container className="py-4">
                <Card>
                    <Card.Header>
                        <h4 className="mb-0">Payment Status</h4>
                    </Card.Header>
                    <Card.Body>
                        <Alert variant={status.variant} className="d-flex align-items-center">
                            {status.icon}
                            {status.message}
                        </Alert>

                        <div className="mb-4">
                            <h5>Asset Details</h5>
                            <p className="mb-1"><strong>Name:</strong> {asset.name}</p>
                            <p className="mb-1"><strong>Amount:</strong> Ksh {payment?.amount?.toLocaleString()}</p>
                        </div>

                        {payment?.status === 'pending' && (
                            <Button
                                variant="primary"
                                onClick={() => window.location.href = route('payments.initiate', asset.id)}
                            >
                                Complete Payment
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
} 