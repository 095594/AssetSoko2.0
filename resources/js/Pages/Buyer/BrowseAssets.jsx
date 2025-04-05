import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Card, Row, Col, Container, Form, Button, Pagination, Badge, Alert, Spinner } from "react-bootstrap";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { FiHeart, FiEyeOff, FiClock, FiSearch, FiFilter } from "react-icons/fi";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';

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
    const [timeLeft, setTimeLeft] = useState(new Date(asset.auction_end_time) - new Date());
    const [currentPrice, setCurrentPrice] = useState(asset.current_price || asset.base_price);

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

    useEffect(() => {
        // Listen for real-time bid updates
        window.Echo.channel('bids')
            .listen('bid.placed', (e) => {
                if (e.bid.asset_id === asset.id) {
                    setCurrentPrice(e.bid.amount);
                    toast.success(`New bid placed: ${formatPrice(e.bid.amount)}`);
                }
            });

        return () => {
            window.Echo.leave('bids');
        };
    }, [asset.id]);

    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const minutesLeft = Math.max(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)), 0);

    const formatPrice = (price) => {
        if (typeof price === 'string') {
            return `Ksh ${parseFloat(price).toLocaleString()}`;
        }
        return `Ksh ${price.toLocaleString()}`;
    };

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

            if (asset.image_url) {
                if (asset.image_url.startsWith('http')) {
                    return asset.image_url;
                }
                return `/storage/${asset.image_url}`;
            }

            return getFallbackImage(asset.category);
        } catch (e) {
            console.error('Error getting image:', e);
            return getFallbackImage(asset.category);
        }
    };

    const handleImageError = (e) => {
        e.target.src = getFallbackImage(asset.category);
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
                    onError={handleImageError}
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
                                <Spinner animation="border" size="sm" />
                            ) : isWatching ? (
                                <FiEyeOff />
                            ) : (
                                <FiHeart />
                            )}
                        </Button>
                    </div>
                    
                    <Card.Text className={`mb-3 ${darkMode ? "text-light" : "text-muted"}`}>
                        Current Price: <strong>{formatPrice(currentPrice)}</strong>
                    </Card.Text>

                    <div className="mt-auto">
                        <Badge bg={timeLeft <= 0 ? "danger" : "info"} className="me-2">
                            <FiClock /> {timeLeft <= 0 ? "Ended" : `${hoursLeft}h ${minutesLeft}m left`}
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(false);
    const [watchlist, setWatchlist] = useState(new Set());

    useEffect(() => {
        // Load watchlist from localStorage
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
            setWatchlist(new Set(JSON.parse(savedWatchlist)));
        }
    }, []);

    const updateFilters = (newParams = {}) => {
        const params = {
            name: searchTerm,
            category: selectedCategory,
            min_price: priceRange.min,
            max_price: priceRange.max,
            sort: sortBy,
            ...newParams
        };

        // Remove empty values
        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
        });

        router.get(route('buyer.assets.index'), params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSearch = debounce((e) => {
        setSearchTerm(e.target.value);
        updateFilters({ name: e.target.value });
    }, 300);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        updateFilters({ category: e.target.value });
    };

    const handlePriceRangeChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceRangeSubmit = (e) => {
        e.preventDefault();
        updateFilters();
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        updateFilters({ sort: e.target.value });
    };

    const handlePagination = (url) => {
        if (!url) return;
        
        // Extract query parameters from the URL
        const urlObj = new URL(url);
        const params = {};
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        updateFilters(params);
    };

    const toggleWatchlist = async (assetId) => {
        setLoading(true);
        try {
            const response = await axios.post(route('watchlist.toggle', assetId));
            const newWatchlist = new Set(watchlist);
            if (response.data.isWatching) {
                newWatchlist.add(assetId);
            } else {
                newWatchlist.delete(assetId);
            }
            setWatchlist(newWatchlist);
            localStorage.setItem('watchlist', JSON.stringify([...newWatchlist]));
            toast.success(response.data.isWatching ? 'Added to watchlist' : 'Removed from watchlist');
        } catch (error) {
            toast.error('Failed to update watchlist');
            console.error('Watchlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BuyerLayout darkMode={darkMode}>
            <Toaster position="top-right" />
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Browse Assets</h2>
                    <div className="d-flex gap-2">
                        <Form.Select 
                            value={sortBy} 
                            onChange={handleSortChange}
                            className="w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="ending_soon">Ending Soon</option>
                        </Form.Select>
                    </div>
                </div>

                <Row className="mb-4">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Search assets..."
                                onChange={handleSearch}
                                className="rounded-pill"
                            />
                        </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="rounded-pill"
                            >
                                <option value="">All Categories</option>
                            {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    <Col md={5}>
                        <Form onSubmit={handlePriceRangeSubmit} className="d-flex gap-2">
                            <Form.Control
                                type="number"
                                name="min"
                                placeholder="Min Price"
                                value={priceRange.min}
                                onChange={handlePriceRangeChange}
                                className="rounded-pill"
                            />
                            <Form.Control
                                type="number"
                                name="max"
                                placeholder="Max Price"
                                value={priceRange.max}
                                onChange={handlePriceRangeChange}
                                className="rounded-pill"
                            />
                            <Button type="submit" variant="primary" className="rounded-pill">
                                <FiFilter /> Filter
                            </Button>
                        </Form>
                        </Col>
                    </Row>

                    <Row>
                    {assets.data.map(asset => (
                            <AssetCard 
                                key={asset.id} 
                                asset={asset} 
                                darkMode={darkMode}
                                toggleWatchlist={toggleWatchlist}
                            isWatching={watchlist.has(asset.id)}
                            loading={loading}
                            />
                        ))}
                    </Row>

                {assets.data.length === 0 && (
                    <Alert variant="info" className="text-center">
                        No assets found matching your criteria.
                    </Alert>
                )}

                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            {assets.links.map((link, index) => (
                                <Pagination.Item
                                    key={index}
                                    active={link.active}
                                    disabled={!link.url}
                                onClick={() => handlePagination(link.url)}
                            >
                                {link.label === '&laquo; Previous' ? 'Previous' : 
                                 link.label === 'Next &raquo;' ? 'Next' : 
                                 link.label}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
            </Container>
        </BuyerLayout>
    );
};

BrowseAssets.propTypes = {
    assets: PropTypes.shape({
        data: PropTypes.array.isRequired,
        links: PropTypes.array.isRequired
    }).isRequired,
    categories: PropTypes.arrayOf(PropTypes.string),
    darkMode: PropTypes.bool,
    auth: PropTypes.object
};

export default BrowseAssets;