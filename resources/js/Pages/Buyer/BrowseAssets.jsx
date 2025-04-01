import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Card, Row, Col, Container, Form, Button, Pagination, Badge, Alert } from "react-bootstrap";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { FiHeart, FiEyeOff, FiClock } from "react-icons/fi";
import axios from "axios";
import { Toaster } from 'react-hot-toast';

const categoryFallbackImages = {
  electronics: '/storage/assets/fallback/electronics.jpg',
  furniture: '/storage/assets/fallback/furniture.jpg',
  vehicles: '/storage/assets/fallback/vehicles.jpg',
  art: '/storage/assets/fallback/art.jpg',
  jewelry: '/storage/assets/fallback/jewelry.jpg',
  'office equipment': '/storage/assets/fallback/office.jpg',
  'Musical Instruments': '/storage/assets/fallback/music.jpg',
  default: '/storage/assets/fallback/default.jpg'
};

const getFallbackImage = (category) => {
  const normalizedCategory = category?.toLowerCase() || '';
  return categoryFallbackImages[normalizedCategory] || categoryFallbackImages.default;
};

const AssetCard = ({ asset, darkMode = false, toggleWatchlist, isWatching, loading }) => {
    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);

    // Debug logging for user information
    console.log('Asset:', {
        id: asset.id,
        name: asset.name,
        user: asset.user,
        user_id: asset.user_id
    });

    // Format price to handle both string and number values
    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return `Ksh ${parseFloat(price).toLocaleString()}`;
        }
        return `Ksh ${price.toLocaleString()}`;
    };

    // Safely get the first image from photos array or fallback
    const getFirstImage = () => {
        try {
            // First try to get from photos array
            if (asset.photos) {
                if (Array.isArray(asset.photos)) {
                    return `/storage/${asset.photos[0]}`;
                }
                
                const parsed = JSON.parse(asset.photos);
                if (Array.isArray(parsed)) {
                    return `/storage/${parsed[0]}`;
                }
            }

            // Then try image_url
            if (asset.image_url) {
                // If it's already a full URL, return it
                if (asset.image_url.startsWith('http')) {
                    return asset.image_url;
                }
                // If it's a storage path, add the storage prefix
                if (asset.image_url.startsWith('assets/')) {
                    return `/storage/${asset.image_url}`;
                }
                return `/storage/${asset.image_url}`;
            }

            // Finally, use category fallback
            return getFallbackImage(asset.category);
        } catch (e) {
            console.error('Error getting image:', e);
            return getFallbackImage(asset.category);
        }
    };

    const handleImageError = (e, assetName) => {
        console.log('Image load error for:', assetName);
        // Use a simple colored div with text as fallback instead of trying to load external files
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Fill with gray background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        // Add text
        ctx.fillStyle = '#333333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(assetName, canvas.width / 2, canvas.height / 2);
        
        // Use the canvas as image source
        e.target.src = canvas.toDataURL('image/png');
    };

    const assetImage = getFirstImage();

    return (
        <Col key={asset.id} lg={4} md={6} className="mb-4">
            <Card 
                className={`border-0 shadow-sm h-100 asset-card ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
                style={{ transition: "0.3s" }}
            >
                <Card.Img
                    variant="top"
                    src={assetImage}
                    alt={asset.name || "Asset Image"}
                    className="rounded-top"
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => handleImageError(e, asset.name)}
                />

                <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                        <Card.Title className="mb-2">{asset.name || "Unnamed Asset"}</Card.Title>
                        <Button 
                            variant={isWatching ? "danger" : "outline-secondary"}
                            size="sm"
                            onClick={() => toggleWatchlist(asset.id)}
                            title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : isWatching ? (
                                <FiEyeOff />
                            ) : (
                                <FiHeart />
                            )}
                        </Button>
                    </div>
                    
                    <Card.Text className={`mb-3 ${darkMode ? "text-light" : "text-muted"}`}>
                        {asset.current_price ? (
                            <>Current Price: <strong>{formatPrice(asset.current_price)}</strong></>
                        ) : (
                            <>Starting Price: <strong>{formatPrice(asset.base_price)}</strong></>
                        )}
                    </Card.Text>

                    <div className="mt-auto">
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
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <span className="text-muted small me-3">
                            Listed by {asset.user?.company_name || asset.user?.name || 'Unknown User'}
                        </span>
                        <Link
                            href={route('buyer.assets.show', asset.id)}
                            className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
                        >
                            View & Bid
                        </Link>
                    </div>
                </Card.Footer>
            </Card>
        </Col>
    );
};

AssetCard.propTypes = {
    asset: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        photos: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        image_url: PropTypes.string,
        current_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        base_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        auction_end_time: PropTypes.string.isRequired,
        bid_count: PropTypes.number,
        category: PropTypes.string,
        user: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    }).isRequired,
    darkMode: PropTypes.bool,
    toggleWatchlist: PropTypes.func.isRequired,
    isWatching: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired
};

const BrowseAssets = ({ assets, categories = [], darkMode = false, auth = {} }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [filteredAssets, setFilteredAssets] = useState(assets.data);
    const [successMessage, setSuccessMessage] = useState(null);
    const [watchlistStatus, setWatchlistStatus] = useState({});

    useEffect(() => {
        setFilteredAssets(assets.data);
        // Initialize watchlist status
        const initialStatus = {};
        assets.data.forEach(asset => {
            initialStatus[asset.id] = {
                isWatching: asset.is_watched,
                loading: false
            };
        });
        setWatchlistStatus(initialStatus);
    }, [assets]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("buyer.assets.index"), {
            name: searchTerm,
            category: selectedCategory,
            min_price: minPrice,
            max_price: maxPrice,
        }, { preserveScroll: true, preserveState: true });
    };

    useEffect(() => {
        const debouncedSearch = debounce(() => {
            router.get(route("buyer.assets.index"), {
                name: searchTerm,
                category: selectedCategory,
                min_price: minPrice,
                max_price: maxPrice,
            }, { preserveScroll: true, preserveState: true });
        }, 500);

        debouncedSearch();

        return () => debouncedSearch.cancel();
    }, [selectedCategory, minPrice, maxPrice]);

    const toggleWatchlist = async (assetId) => {
        setWatchlistStatus(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                loading: true
            }
        }));

        try {
            const response = await axios.post(`/buyer/watchlist/${assetId}`);
            setWatchlistStatus(prev => ({
                ...prev,
                [assetId]: {
                    isWatching: response.data.watching,
                    loading: false
                }
            }));
            setSuccessMessage(response.data.message);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            setWatchlistStatus(prev => ({
                ...prev,
                [assetId]: {
                    ...prev[assetId],
                    loading: false
                }
            }));
        }
    };

    return (
        <BuyerLayout>
            <Toaster position="top-right" />
            <Container className="mt-3">
                {successMessage && (
                    <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
                        {successMessage}
                    </Alert>
                )}

                <h4 className="text-center mb-3">Available Assets</h4>

                {/* Search & Filter Section */}
                <Form onSubmit={handleSearch} className="mb-4">
                    <Row className="g-2">
                        <Col md={3}>
                            <Form.Control
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {Array.isArray(categories) && categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Control
                                type="number"
                                placeholder="Min Price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                min="0"
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Control
                                type="number"
                                placeholder="Max Price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                min={minPrice || "0"}
                            />
                        </Col>
                        <Col md={2}>
                            <Button 
                                type="submit" 
                                variant={darkMode ? "light" : "dark"} 
                                className="w-100"
                            >
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* Asset List */}
                {filteredAssets.length === 0 ? (
                    <Card className={`text-center ${darkMode ? "bg-dark text-light" : "bg-light"}`}>
                        <Card.Body>
                            <h5>No assets found</h5>
                            <p className="text-muted">
                                {searchTerm || selectedCategory || minPrice || maxPrice ? (
                                    "Try adjusting your search filters"
                                ) : (
                                    "Check back later for new listings"
                                )}
                            </p>
                            {(searchTerm || selectedCategory || minPrice || maxPrice) && (
                                <Button 
                                    variant={darkMode ? "light" : "dark"}
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory("");
                                        setMinPrice("");
                                        setMaxPrice("");
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {filteredAssets.map((asset) => (
                            <AssetCard 
                                key={asset.id} 
                                asset={asset} 
                                darkMode={darkMode}
                                toggleWatchlist={toggleWatchlist}
                                isWatching={watchlistStatus[asset.id]?.isWatching || false}
                                loading={watchlistStatus[asset.id]?.loading || false}
                            />
                        ))}
                    </Row>
                )}

                {/* Pagination */}
                {assets.total > assets.per_page && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            {assets.links.map((link, index) => (
                                <Pagination.Item
                                    key={index}
                                    active={link.active}
                                    disabled={!link.url}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) {
                                            router.get(link.url, {
                                                name: searchTerm,
                                                category: selectedCategory,
                                                min_price: minPrice,
                                                max_price: maxPrice,
                                            }, { preserveScroll: true, preserveState: true });
                                        }
                                    }}
                                >
                                    {link.label.replace(/&[^;]+;/g, "")}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                )}
            </Container>
        </BuyerLayout>
    );
};

BrowseAssets.propTypes = {
    assets: PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            photos: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
            image_url: PropTypes.string,
            current_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            base_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            auction_end_time: PropTypes.string.isRequired,
            bid_count: PropTypes.number,
            category: PropTypes.string,
            user: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired
            }),
            is_watched: PropTypes.bool
        })).isRequired,
        total: PropTypes.number.isRequired,
        per_page: PropTypes.number.isRequired,
        links: PropTypes.arrayOf(PropTypes.shape({
            url: PropTypes.string,
            label: PropTypes.string.isRequired,
            active: PropTypes.bool.isRequired
        })).isRequired
    }).isRequired,
    categories: PropTypes.arrayOf(PropTypes.string),
    darkMode: PropTypes.bool,
    auth: PropTypes.object
};

export default BrowseAssets;