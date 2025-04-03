import React, { useState, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { Container, Row, Col, Card, Button, Badge, Form, Carousel, Tab, Nav, Alert } from "react-bootstrap";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { FiHeart, FiClock, FiDollarSign, FiUser, FiArrowLeft } from "react-icons/fi";
import { useForm } from "@inertiajs/react";

const AssetDetail = ({ asset, auth, darkMode }) => {
    const [bidAmount, setBidAmount] = useState(asset.current_price + (asset.bid_increment || 1));
    const [isWatching, setIsWatching] = useState(asset.is_watched);
    const [activeTab, setActiveTab] = useState('details');
    const { data, setData, post, processing, errors } = useForm({
        amount: bidAmount,
    });

    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const isAuctionActive = new Date(asset.auction_end_time) > new Date();

    const toggleWatchlist = () => {
        router.post(`/buyer/watchlist/${asset.id}`, {}, {
            preserveScroll: true,
            onSuccess: () => setIsWatching(!isWatching),
        });
    };

    const handleBidSubmit = (e) => {
        e.preventDefault();
        post(route('buyer.bids.store', asset.id), {
            preserveScroll: true,
        });
    };
    const assetImages = React.useMemo(() => {
        try {
            if (asset.photos) {
                if (Array.isArray(asset.photos)) {
                    return asset.photos.map(photo => `/storage/${photo}`);
                }
                const parsed = JSON.parse(asset.photos);
                if (Array.isArray(parsed)) {
                    return parsed.map(photo => `/storage/${photo}`);
                }
            }
            if (asset.image_url) {
                if (asset.image_url.startsWith('http')) {
                    return [asset.image_url];
                }
                return [`/storage/${asset.image_url}`];
            }
            return [getFallbackImage(asset.category)];
        } catch (e) {
            console.error('Error processing images:', e);
            return [getFallbackImage(asset.category)];
        }
    }, [asset.photos, asset.image_url, asset.category]);
    return (
        <BuyerLayout>
            <Container className="mt-4">
                <Link href="/browse" className="d-flex align-items-center mb-3">
                    <FiArrowLeft className="me-2" /> Back to Assets
                </Link>

                <Row className="g-4">
                    {/* Left Column - Images */}
                    <Col lg={6}>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                {asset.image && asset.image.length > 0 ? (
                                 <Carousel interval={null} indicators={assetImages.length > 1}>
                                 {assetImages.map((image, index) => (
                                     <Carousel.Item key={index}>
                                         <img
                                             className="d-block w-100 rounded"
                                             src={image}
                                             alt={`${asset.name} - ${index + 1}`}
                                             style={{ height: '400px', objectFit: 'contain' }}
                                         />
                                     </Carousel.Item>
                                 ))}
                             </Carousel>
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center bg-light" 
                                         style={{ height: '400px' }}>
                                        <span className="text-muted">No images available</span>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Details */}
                    <Col lg={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2>{asset.name}</h2>
                                        <div className="d-flex align-items-center text-muted mb-2">
                                            <FiUser className="me-2" />
                                            <span>Seller: {asset.seller?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant={isWatching ? "danger" : "outline-primary"}
                                        onClick={toggleWatchlist}
                                        title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                                    >
                                        {isWatching ? "Watching" : "Watch"}
                                    </Button>
                                </div>

                                <div className="mb-4">
                                    <Badge bg="info" className="me-2">
                                        <FiClock /> {hoursLeft}h left
                                    </Badge>
                                    <Badge bg="secondary">
                                        {asset.bid_count} bids
                                    </Badge>
                                    <Badge bg="warning" className="ms-2">
                                        {asset.category}
                                    </Badge>
                                </div>

                                <div className="mb-4">
                                    <h4 className="d-flex align-items-center">
                                        <FiDollarSign className="me-2" />
                                        {asset.current_price ? (
                                            <>
                                                Current Bid: <strong className="ms-2">Ksh {asset.current_price}</strong>
                                            </>
                                        ) : (
                                            <>
                                                Starting Price: <strong className="ms-2">Ksh {asset.starting_price}</strong>
                                            </>
                                        )}
                                    </h4>
                                    <small className="text-muted">
                                        Bid increment: Ksh {asset.bid_increment || 1}
                                    </small>
                                </div>

                                {/* Tabs for Description and Bids */}
                                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                                    <Nav variant="tabs" className="mb-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="details">Details</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="bids">Bid History</Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content className="flex-grow-1">
                                        <Tab.Pane eventKey="details">
                                            <p className="text-muted">{asset.description || 'No description provided.'}</p>
                                            <div className="mt-3">
                                                <h5>Additional Information</h5>
                                                <ul className="list-unstyled">
                                                    <li><strong>Condition:</strong> {asset.condition || 'Not specified'}</li>
                                                    <li><strong>Location:</strong> {asset.location || 'Not specified'}</li>
                                                    <li><strong>Listed:</strong> {new Date(asset.created_at).toLocaleDateString()}</li>
                                                </ul>
                                            </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="bids">
                                            {asset.bids?.length > 0 ? (
                                                <div className="list-group">
                                                    {asset.bids.map((bid) => (
                                                        <div key={bid.id} className="list-group-item">
                                                            <div className="d-flex justify-content-between">
                                                                <span>{bid.bidder?.name || 'Anonymous'}</span>
                                                                <span>Ksh {bid.amount}</span>
                                                            </div>
                                                            <small className="text-muted">
                                                                {new Date(bid.created_at).toLocaleString()}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No bids yet.</p>
                                            )}
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>

                                {/* Bid Form */}
                                {isAuctionActive && (
                                    <div className="mt-auto pt-3">
                                        <Form onSubmit={handleBidSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Your Bid (Minimum: Ksh {asset.current_price + (asset.bid_increment || 1)})</Form.Label>
                                                <div className="d-flex">
                                                    <Form.Control
                                                        type="number"
                                                        value={data.amount}
                                                        onChange={(e) => setData('amount', parseFloat(e.target.value))}
                                                        min={asset.current_price + (asset.bid_increment || 1)}
                                                        step={asset.bid_increment || 1}
                                                        required
                                                    />
                                                    <Button variant="primary" type="submit" className="ms-2" disabled={processing}>
                                                        Place Bid
                                                    </Button>
                                                </div>
                                                {errors.amount && <Alert variant="danger" className="mt-2">{errors.amount}</Alert>}
                                            </Form.Group>
                                        </Form>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </BuyerLayout>
    );
};

export default AssetDetail;