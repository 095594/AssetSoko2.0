import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, ListGroup, Badge, Button, Spinner } from "react-bootstrap";
import { FiBell, FiArrowLeft, FiCheck, FiX, FiDollarSign, FiClock } from "react-icons/fi";

const NotificationItem = ({ notification }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'bid':
                return <FiDollarSign className="text-primary" />;
            case 'auction_end':
                return <FiClock className="text-warning" />;
            default:
                return <FiBell className="text-info" />;
        }
    };

    const getBadgeColor = () => {
        switch (notification.type) {
            case 'bid':
                return 'primary';
            case 'auction_end':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <ListGroup.Item className="border-0 border-bottom py-3">
            <div className="d-flex align-items-start">
                <div className="me-3">
                    {getIcon()}
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-1">{notification.title}</h6>
                        <Badge bg={getBadgeColor()} className="ms-2">
                            {notification.type}
                        </Badge>
                    </div>
                    <p className="text-muted mb-2">{notification.message}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            {new Date(notification.created_at).toLocaleString()}
                        </small>
                        {notification.asset_id && (
                            <Link 
                                href={`/buyer/assets/${notification.asset_id}`}
                                className="btn btn-sm btn-outline-primary"
                            >
                                View Asset
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </ListGroup.Item>
    );
};

const Notifications = () => {
    const { props } = usePage();
    const { notifications: initialNotifications = [], auth } = props;
    const [notifications, setNotifications] = useState(initialNotifications);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth?.user?.id && window.Echo) {
            const echo = window.Echo;
            echo.private(`private-user.${auth.user.id}`)
                .listen('NewNotification', (data) => {
                    setNotifications(prev => [data.notification, ...prev]);
                });

            return () => {
                echo.leave(`private-user.${auth.user.id}`);
            };
        }
    }, [auth?.user?.id]);

    const markAllAsRead = () => {
        // TODO: Implement mark all as read functionality
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    return (
        <BuyerLayout>
            <Head title="Notifications" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">Notifications</h3>
                        <p className="text-muted mb-0">Stay updated with your auction activities</p>
                    </div>
                    <div>
                        <Button 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={markAllAsRead}
                        >
                            <FiCheck className="me-2" /> Mark All as Read
                        </Button>
                        <Link href={route('buyer.dashboard')} className="btn btn-outline-secondary">
                            <FiArrowLeft className="me-2" /> Back to Dashboard
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : notifications.length > 0 ? (
                    <Card className="shadow-sm border-0">
                        <ListGroup variant="flush">
                            {notifications.map((notification) => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                />
                            ))}
                        </ListGroup>
                    </Card>
                ) : (
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center py-5">
                            <FiBell className="display-4 text-muted mb-3" />
                            <h5>No Notifications</h5>
                            <p className="text-muted">You're all caught up!</p>
                            <Link 
                                href={route('buyer.assets.index')} 
                                className="btn btn-primary"
                            >
                                Browse Assets
                            </Link>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </BuyerLayout>
    );
};

export default Notifications; 