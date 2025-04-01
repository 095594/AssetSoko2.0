import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import { FiClock, FiEyeOff } from 'react-icons/fi';

const Watchlist = ({ watchlist, darkMode }) => {
    const getAssetImage = (asset) => {
        if (asset.photos && asset.photos.length > 0) {
            const photos = typeof asset.photos === 'string' ? JSON.parse(asset.photos) : asset.photos;
            return photos[0] ? `/storage/${photos[0]}` : '/images/placeholder.jpg';
        }
        return asset.image_url ? `/storage/${asset.image_url}` : '/images/placeholder.jpg';
    };

    const getFallbackImage = (category) => {
        switch (category?.toLowerCase()) {
            case 'electronics':
                return '/images/electronics-placeholder.jpg';
            case 'furniture':
                return '/images/furniture-placeholder.jpg';
            case 'vehicles':
                return '/images/vehicles-placeholder.jpg';
            default:
                return '/images/placeholder.jpg';
        }
    };

    return (
        <BuyerLayout>
            <Container className="mt-4">
                <h4 className="text-center mb-4">My Watchlist</h4>

                {watchlist.length === 0 ? (
                    <Card className={`text-center ${darkMode ? "bg-dark text-light" : "bg-light"}`}>
                        <Card.Body>
                            <h5>Your watchlist is empty</h5>
                            <p className="text-muted">Start adding items to your watchlist to track them</p>
                            <Link 
                                href={route('buyer.assets.index')}
                                className={`btn ${darkMode ? "btn-light" : "btn-dark"}`}
                            >
                                Browse Assets
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {watchlist.map((asset) => {
                            const timeLeft = new Date(asset.auction_end_time) - new Date();
                            const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);

                            return (
                                <Col key={asset.id} lg={4} md={6} className="mb-4">
                                    <Card 
                                        className={`border-0 shadow-sm h-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
                                    >
                                        <Card.Img
                                            variant="top"
                                            src={getAssetImage(asset)}
                                            alt={asset.name || "Asset Image"}
                                            className="w-full h-48 object-cover rounded-t"
                                            onError={(e) => (e.target.src = getFallbackImage(asset.category))}
                                        />
                                        <Card.Body>
                                            <Card.Title>{asset.name}</Card.Title>
                                            <Card.Text>
                                                {asset.current_price ? (
                                                    <>Current Price: <strong>Ksh {asset.current_price.toLocaleString()}</strong></>
                                                ) : (
                                                    <>Starting Price: <strong>Ksh {asset.base_price.toLocaleString()}</strong></>
                                                )}
                                            </Card.Text>
                                            <div className="mb-3">
                                                <Badge bg="info" className="me-2">
                                                    <FiClock /> {hoursLeft}h left
                                                </Badge>
                                                <Badge bg="secondary">
                                                    {asset.bids?.length || 0} bids
                                                </Badge>
                                                <Badge bg="warning" className="ms-2 text-capitalize">
                                                    {asset.category}
                                                </Badge>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className={`${darkMode ? "text-light" : "text-muted"}`}>
                                                    Seller: {asset.seller?.name || 'Unknown'}
                                                </small>
                                                <Link 
                                                    href={route('buyer.assets.show', asset.id)}
                                                    className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
                                                >
                                                    View & Bid
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>
        </BuyerLayout>
    );
};

export default Watchlist; 