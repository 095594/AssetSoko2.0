import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";
import { FiClock, FiArrowLeft, FiDollarSign, FiEye } from "react-icons/fi";

const AssetCard = ({ asset }) => {
    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);

    const getFirstImage = () => {
        try {
            if (asset.photos) {
                if (Array.isArray(asset.photos)) {
                    return asset.photos[0];
                }
                
                const parsed = JSON.parse(asset.photos);
                if (Array.isArray(parsed)) {
                    return parsed[0];
                }
            }
            if (typeof asset.photos === 'string' && asset.photos.trim().startsWith('assets/')) {
                return asset.photos;
            }
            return asset.image_url;
        } catch (e) {
            return asset.image_url;
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
                />
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-2">{asset.name}</Card.Title>
                    <div className="mb-3">
                        <span className="text-muted">Starting Price: </span>
                        <span className="fw-bold">
                            Ksh {asset.base_price?.toLocaleString()}
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
                        <div className="d-flex gap-2">
                            <Link 
                                href={`/buyer/assets/${asset.id}`}
                                className="btn btn-primary flex-grow-1"
                            >
                                View Details
                            </Link>
                            <Link 
                                href={`/buyer/assets/${asset.id}`}
                                className="btn btn-outline-primary"
                            >
                                <FiEye />
                            </Link>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
};

const RecentAssets = () => {
    const { props } = usePage();
    const { recentAssets: initialAssets = [], auth } = props;
    const [assets, setAssets] = useState(initialAssets);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth?.user?.id && window.Echo) {
            const echo = window.Echo;
            echo.channel('assets')
                .listen('NewAsset', (data) => {
                    setAssets(prev => [data.asset, ...prev]);
                });

            return () => {
                echo.leave('assets');
            };
        }
    }, [auth?.user?.id]);

    return (
        <BuyerLayout>
            <Head title="Recent Assets" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">Recent Assets</h3>
                        <p className="text-muted mb-0">Browse newly listed auction items</p>
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
                ) : assets.length > 0 ? (
                    <Row>
                        {assets.map((asset) => (
                            <AssetCard key={asset.id} asset={asset} />
                        ))}
                    </Row>
                ) : (
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center py-5">
                            <FiEye className="display-4 text-muted mb-3" />
                            <h5>No Recent Assets</h5>
                            <p className="text-muted">Check back later for new listings</p>
                            <Link 
                                href={route('buyer.assets.index')} 
                                className="btn btn-primary"
                            >
                                Browse All Assets
                            </Link>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </BuyerLayout>
    );
};

export default RecentAssets; 