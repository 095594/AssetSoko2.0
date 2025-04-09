import React, { useState, useEffect } from "react";
import { Card, Row, Col, Container, Button, Carousel, Badge, Alert, Form } from "react-bootstrap";
import { Link, router } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { FiHeart, FiClock, FiUser, FiDollarSign, FiInfo, FiCalendar } from "react-icons/fi";
import axios from "axios";
import { format } from "date-fns";

const AssetShow = ({ asset, darkMode, auth }) => {
    const [bidAmount, setBidAmount] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isWatching, setIsWatching] = useState(asset.is_watched || false);
    const [loading, setLoading] = useState(false);
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [timeLeft, setTimeLeft] = useState(new Date(asset.auction_end_time) - new Date());

    // Update time left every second
    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = new Date(asset.auction_end_time) - new Date();
            setTimeLeft(newTimeLeft);
            
            if (newTimeLeft <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [asset.auction_end_time]);

    // Calculate time left display
    const calculateTimeLeft = () => {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        if (timeLeft <= 0) {
            return `Ended ${format(new Date(asset.auction_end_time), 'MMM d, yyyy h:mm a')}`;
        }

        if (days > 0) {
            return `${days}d ${hours}h left`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m left`;
        } else {
            return `${minutes}m ${seconds}s left`;
        }
    };

    // Parse and set photos
    useEffect(() => {
        try {
            if (asset.photos) {
                // Check if it's already an array
                if (Array.isArray(asset.photos)) {
                    setPhotos(asset.photos.map(photo => `/storage/${photo}`));
                } else {
                    // Try parsing as JSON
                    const parsed = JSON.parse(asset.photos);
                    setPhotos(Array.isArray(parsed) ? parsed.map(photo => `/storage/${photo}`) : []);
                }
            }
        } catch (e) {
            console.error("Error parsing photos:", e);
            setPhotos([]);
        }
    }, [asset.photos]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        
        try {
            const response = await axios.post(`/buyer/assets/${asset.id}/bid`, {
                amount: bidAmount
            });
            
            setSuccessMessage(response.data.message);
            setTimeout(() => setSuccessMessage(null), 3000);
            setBidAmount("");
            // Refresh the page to show updated bid information
            router.reload();
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 
                "Failed to place bid. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleWatchlist = async () => {
        setWatchlistLoading(true);
        try {
            const response = await axios.post(`/buyer/watchlist/${asset.id}`);
            setIsWatching(response.data.watching);
            setSuccessMessage(response.data.message);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        } finally {
            setWatchlistLoading(false);
        }
    };

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
                {successMessage && (
                    <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
                        {successMessage}
                    </Alert>
                )}
                
                {errorMessage && (
                    <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
                        {errorMessage}
                    </Alert>
                )}

                <Link 
                    to={route('buyer.assets.index')} 
                    className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mb-4`}
                >
                    &larr; Back to Assets
                </Link>

                <Row>
                    {/* Asset Images */}
                    <Col lg={6} className="mb-4">
                        <Card className={`${darkMode ? "bg-dark text-light" : "bg-light"}`}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Card.Title as="h2">{asset.name}</Card.Title>
                                    <Button 
                                        variant={isWatching ? "danger" : "outline-secondary"}
                                        onClick={toggleWatchlist}
                                        disabled={watchlistLoading}
                                        title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                                    >
                                        {watchlistLoading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : isWatching ? (
                                            <FiHeart fill="currentColor" />
                                        ) : (
                                            <FiHeart />
                                        )}
                                    </Button>
                                </div>

                                <div className="mb-4">
                                    <Badge bg="info" className="me-2">
                                        <FiClock /> {calculateTimeLeft()}
                                    </Badge>
                                    <Badge bg={asset.status === 'active' ? 'success' : 'danger'}>
                                        {asset.status.toUpperCase()}
                                    </Badge>
                                    <Badge bg="warning" className="ms-2">
                                        {asset.category}
                                    </Badge>
                                </div>

                                <Card.Text className="mb-4">
                                    {asset.description || "No description provided."}
                                </Card.Text>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiUser className="me-2" /> Seller Information
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Name:</strong> {asset.seller?.name || 'Unknown'}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Company:</strong> {asset.seller?.company_name || 'Not specified'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiInfo className="me-2" /> Auction Details
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Condition:</strong> {asset.condition}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Quantity:</strong> {asset.quantity}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Start Time:</strong> {new Date(asset.auction_start_time).toLocaleString()}
                                    </p>
                                    <p className="mb-1">
                                        <strong>End Time:</strong> {new Date(asset.auction_end_time).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiDollarSign className="me-2" /> Pricing
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Starting Price:</strong> Ksh {asset.base_price}
                                    </p>
                                    {asset.reserve_price && (
                                        <p className="mb-1">
                                            <strong>Reserve Price:</strong> Ksh {asset.reserve_price}
                                        </p>
                                    )}
                                    <p className="mb-1">
                                        <strong>Current Bid:</strong> {asset.current_price ? `Ksh ${asset.current_price}` : 'No bids yet'}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Total Bids:</strong> {asset.bid_count}
                                    </p>
                                </div>

                                {asset.status === 'active' && (
                                    <Form onSubmit={handleBidSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Enter Your Bid (Minimum: Ksh {Math.max(asset.current_price || asset.base_price, asset.base_price)})</strong>
                                            </Form.Label>
                                            <div className="d-flex">
                                                <Form.Control
                                                    type="number"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    min={Math.max(asset.current_price || asset.base_price, asset.base_price)}
                                                    step="100"
                                                    required
                                                    className="me-2"
                                                />
                                                <Button 
                                                    variant={darkMode ? "light" : "dark"} 
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        "Place Bid"
                                                    )}
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Asset Details */}
                    <Col lg={6}>
                        <Card className={`${darkMode ? "bg-dark text-light" : "bg-light"}`}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Card.Title as="h2">{asset.name}</Card.Title>
                                    <Button 
                                        variant={isWatching ? "danger" : "outline-secondary"}
                                        onClick={toggleWatchlist}
                                        disabled={watchlistLoading}
                                        title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                                    >
                                        {watchlistLoading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : isWatching ? (
                                            <FiHeart fill="currentColor" />
                                        ) : (
                                            <FiHeart />
                                        )}
                                    </Button>
                                </div>

                                <div className="mb-4">
                                    <Badge bg="info" className="me-2">
                                        <FiClock /> {calculateTimeLeft()}
                                    </Badge>
                                    <Badge bg={asset.status === 'active' ? 'success' : 'danger'}>
                                        {asset.status.toUpperCase()}
                                    </Badge>
                                    <Badge bg="warning" className="ms-2">
                                        {asset.category}
                                    </Badge>
                                </div>

                                <Card.Text className="mb-4">
                                    {asset.description || "No description provided."}
                                </Card.Text>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiUser className="me-2" /> Seller Information
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Name:</strong> {asset.seller?.name || 'Unknown'}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Company:</strong> {asset.seller?.company_name || 'Not specified'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiInfo className="me-2" /> Auction Details
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Condition:</strong> {asset.condition}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Quantity:</strong> {asset.quantity}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Start Time:</strong> {new Date(asset.auction_start_time).toLocaleString()}
                                    </p>
                                    <p className="mb-1">
                                        <strong>End Time:</strong> {new Date(asset.auction_end_time).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="d-flex align-items-center">
                                        <FiDollarSign className="me-2" /> Pricing
                                    </h5>
                                    <p className="mb-1">
                                        <strong>Starting Price:</strong> Ksh {asset.base_price}
                                    </p>
                                    {asset.reserve_price && (
                                        <p className="mb-1">
                                            <strong>Reserve Price:</strong> Ksh {asset.reserve_price}
                                        </p>
                                    )}
                                    <p className="mb-1">
                                        <strong>Current Bid:</strong> {asset.current_price ? `Ksh ${asset.current_price}` : 'No bids yet'}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Total Bids:</strong> {asset.bid_count}
                                    </p>
                                </div>

                                {asset.status === 'active' && (
                                    <Form onSubmit={handleBidSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Enter Your Bid (Minimum: Ksh {Math.max(asset.current_price || asset.base_price, asset.base_price)})</strong>
                                            </Form.Label>
                                            <div className="d-flex">
                                                <Form.Control
                                                    type="number"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    min={Math.max(asset.current_price || asset.base_price, asset.base_price)}
                                                    step="100"
                                                    required
                                                    className="me-2"
                                                />
                                                <Button 
                                                    variant={darkMode ? "light" : "dark"} 
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        "Place Bid"
                                                    )}
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </BuyerLayout>
    );
};

export default AssetShow;