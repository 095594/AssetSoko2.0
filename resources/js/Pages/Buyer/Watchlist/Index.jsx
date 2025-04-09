import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";
import { FiClock, FiEye, FiArrowLeft, FiDollarSign } from "react-icons/fi";

const WatchlistCard = ({ asset }) => {
    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);

    const getFirstImage = () => {
        try {
            if (asset.photos) {
                if (Array.isArray(asset.photos)) {
                    return `/storage/${asset.photos[0]}`;
                }
                
                const parsed = JSON.parse(asset.photos);
                if (Array.isArray(parsed)) {
                    return `/storage/${parsed[0]}`;
                }
            }
            if (typeof asset.photos === 'string' && asset.photos.trim().startsWith('assets/')) {
                return `/storage/${asset.photos}`;
            }
            return asset.image_url ? `/storage/${asset.image_url}` : '/images/placeholder.jpg';
        } catch (e) {
            return '/images/placeholder.jpg';
        }
    };

    return (
        <Col lg={4} md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
                <Card.Img
                    variant="top"
                    src={getFirstImage()}
                    alt={asset.name}
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                    }}
                />
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-2">{asset.name}</Card.Title>
                    <div className="mb-3">
                        <span className="text-muted">Current Price: </span>
                        <span className="fw-bold">
                            Ksh {asset.current_price?.toLocaleString() || asset.base_price?.toLocaleString()}
                        </span>
                    </div>
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Badge bg="info" className="d-flex align-items-center">
                                <FiClock className="me-1" /> {hoursLeft}h left
                            </Badge>
                            <Badge bg="secondary">
                                {asset.bids?.length || 0} bids
                            </Badge>
                        </div>
                        <Link 
                            href={`/buyer/assets/${asset.id}`}
                            className="btn btn-primary w-100"
                        >
                            View & Bid
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
};

const Watchlist = () => {
    const { props } = usePage();
    const { watchlist: initialWatchlist = [], auth } = props;
    const [watchlist, setWatchlist] = useState(initialWatchlist);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth?.user?.id && window.Echo) {
            const echo = window.Echo;
            echo.private(`private-user.${auth.user.id}`)
                .listen('WatchlistUpdated', (data) => {
                    if (data.isWatching) {
                        setWatchlist(prev => [...prev, data.asset]);
                    } else {
                        setWatchlist(prev => prev.filter(item => item.id !== data.assetId));
                    }
                });

            return () => {
                echo.leave(`private-user.${auth.user.id}`);
            };
        }
    }, [auth?.user?.id]);

    return (
        <BuyerLayout>
            <Head title="Watchlist" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">My Watchlist</h3>
                        <p className="text-muted mb-0">Track your favorite assets</p>
                    </div>
                    <Link href={route('buyer.dashboard')} className="btn btn-outline-secondary">
                        <FiArrowLeft className="me-2" /> Back to Dashboard
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : watchlist.length > 0 ? (
                    <Row>
                        {watchlist.map((asset) => (
                            <WatchlistCard key={asset.id} asset={asset} />
                        ))}
                    </Row>
                ) : (
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center py-5">
                            <FiEye className="display-4 text-muted mb-3" />
                            <h5>Your Watchlist is Empty</h5>
                            <p className="text-muted">Start adding items to track them</p>
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

export default Watchlist; 