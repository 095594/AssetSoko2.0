import React from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { Container, Card, Table, Button, Badge } from 'react-bootstrap';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

const Notifications = ({ notifications, darkMode }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KSH'
        }).format(amount);
    };

    return (
        <BuyerLayout darkMode={darkMode}>
            <Head title="Notifications" />
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Notifications</h2>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="primary"
                            onClick={() => window.location.href = route('notifications.markAllAsRead')}
                        >
                            <FiCheck className="me-2" />
                            Mark All as Read
                        </Button>
                    </div>
                </div>

                <Card className={darkMode ? "bg-dark text-light" : ""}>
                    <Card.Body>
                        <Table responsive hover variant={darkMode ? "dark" : ""}>
                            <thead>
                                <tr>
                                    <th>Message</th>
                                    <th>Asset</th>
                                    <th>Bidder</th>
                                    <th>Bid Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.data.map((notification) => (
                                    <tr key={notification.id} className={notification.read_at ? "" : "fw-bold"}>
                                        <td>{notification.data.message}</td>
                                        <td>
                                            {notification.asset ? (
                            <Link 
                                                    href={route('buyer.assets.show', notification.asset.id)}
                                                    className={darkMode ? "text-light" : ""}
                            >
                                                    {notification.asset.name}
                            </Link>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {notification.bid?.user ? (
                                                <span>
                                                    {notification.bid.user.company_name || notification.bid.user.name}
                                                </span>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {notification.bid ? (
                                                <span>{formatCurrency(notification.bid.amount)}</span>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td>{formatDate(notification.created_at)}</td>
                                        <td>
                                            <Badge bg={notification.read_at ? "secondary" : "primary"}>
                                                {notification.read_at ? "Read" : "Unread"}
                                            </Badge>
                                        </td>
                                        <td>
                                            {!notification.read_at && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => window.location.href = route('notifications.markAsRead', notification.id)}
                                                >
                                                    <FiCheckCircle className="me-1" />
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </Card.Body>
                    </Card>
            </Container>
        </BuyerLayout>
    );
};

export default Notifications; 