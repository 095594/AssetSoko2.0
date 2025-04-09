import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Table, Row, Col, Badge, Button, ListGroup, ProgressBar, Dropdown, Spinner } from "react-bootstrap";
import { 
    FiClock, 
    FiEye, 
    FiArrowLeft, 
    FiDollarSign, 
    FiTrendingUp,
    FiAlertCircle,
    FiCalendar,
    FiAward,
    FiArrowRight,
    FiBell,
    FiHeart,
    FiInfo
} from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { format, differenceInHours, isAfter, isBefore } from 'date-fns';
import '../../../css/buyer-dashboard.css';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NotificationItem = ({ notification, markAsRead }) => (
    <ListGroup.Item 
        className="d-flex justify-content-between align-items-center notification-item"
        action
        onClick={() => markAsRead(notification.id)}
    >
        <div>
            <div className="notification-message">{notification.message}</div>
            <small className="text-muted">
                {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
            </small>
        </div>
        {!notification.read_at && <Badge bg="primary" className="notification-badge">New</Badge>}
    </ListGroup.Item>
);

const WatchlistItem = ({ item }) => {
    const timeLeft = new Date(item.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const isEndingSoon = hoursLeft < 24;
    const isEnded = hoursLeft <= 0;

    return (
        <ListGroup.Item className="d-flex justify-content-between align-items-center watchlist-item">
            <div className="watchlist-item-content">
                <Link href={`/buyer/assets/${item.id}`} className="text-decoration-none asset-name">
                    {item.name}
                </Link>
                <div className="text-muted small">
                    {item.bids?.length || 0} bids · Current: Ksh {item.current_price?.toLocaleString() || item.base_price?.toLocaleString()}
                </div>
                <div className="mt-1">
                    <small className="text-muted">Ends: {format(new Date(item.auction_end_time), 'MMM d, yyyy h:mm a')}</small>
                </div>
            </div>
            <div className="watchlist-item-status">
                {isEnded ? (
                    <Badge bg="secondary">Ended</Badge>
                ) : (
                    <Badge bg={isEndingSoon ? "danger" : "warning"} className="d-flex align-items-center">
                        <FiClock className="me-1" /> {hoursLeft}h
                    </Badge>
                )}
            </div>
        </ListGroup.Item>
    );
};

const BidActivityChart = ({ bidActivity }) => {
  const data = {
    labels: bidActivity.map(item => format(new Date(item.date), 'MMM d')),
    datasets: [
      {
        label: 'Bids Placed',
        data: bidActivity.map(item => item.count),
        borderColor: 'rgb(78, 115, 223)',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} bids`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0
        }
      }
    }
  };

  return <Line options={options} data={data} />;
};

const PriceDistributionChart = ({ assets }) => {
  // Group assets by price range
  const priceRanges = {
    '0-100': 0,
    '101-500': 0,
    '501-1000': 0,
    '1001-5000': 0,
    '5000+': 0
  };

  assets.forEach(asset => {
    const price = asset.current_price || asset.starting_price;
    if (price <= 100) priceRanges['0-100']++;
    else if (price <= 500) priceRanges['101-500']++;
    else if (price <= 1000) priceRanges['501-1000']++;
    else if (price <= 5000) priceRanges['1001-5000']++;
    else priceRanges['5000+']++;
  });

  const data = {
    labels: Object.keys(priceRanges),
    datasets: [
      {
        label: 'Number of Assets',
        data: Object.values(priceRanges),
        backgroundColor: [
          'rgba(78, 115, 223, 0.7)',
          'rgba(28, 200, 138, 0.7)',
          'rgba(54, 185, 204, 0.7)',
          'rgba(246, 194, 62, 0.7)',
          'rgba(231, 74, 59, 0.7)',
        ],
        borderColor: [
          'rgba(78, 115, 223, 1)',
          'rgba(28, 200, 138, 1)',
          'rgba(54, 185, 204, 1)',
          'rgba(246, 194, 62, 1)',
          'rgba(231, 74, 59, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `${context.parsed} assets`;
          }
        }
      }
    }
  };

  return <Pie options={options} data={data} />;
};

const BidStatusChart = ({ bids }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Bid Amount',
                data: [],
                borderColor: 'rgb(78, 115, 223)',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                tension: 0.3,
                fill: true
            }
        ]
    });

    useEffect(() => {
        if (bids && bids.length > 0) {
            const sortedBids = [...bids].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            const labels = sortedBids.map(bid => 
                format(new Date(bid.created_at), 'MMM d')
            );
            
            const data = sortedBids.map(bid => bid.amount);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Bid Amount',
                        data,
                        borderColor: 'rgb(78, 115, 223)',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            });
        }
    }, [bids]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function(context) {
                        return `Ksh ${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return 'Ksh ' + value.toLocaleString();
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

const AssetCard = ({ asset, darkMode, toggleWatchlist, isWatching, loading }) => {
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
        <Card className={`h-100 ${darkMode ? 'bg-dark text-light' : ''}`}>
            <div className="position-relative">
                <Card.Img 
                    variant="top" 
                    src={assetImage} 
                    alt={asset.name}
                    onError={handleImageError}
                    style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 end-0 p-2">
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => toggleWatchlist(asset.id)}
                        disabled={loading}
                    >
                        {isWatching ? <FiHeart className="text-danger" /> : <FiHeart />}
                    </Button>
                </div>
            </div>
            <Card.Body>
                <Card.Title>{asset.name}</Card.Title>
                <Card.Text className="text-muted">
                    {asset.description.length > 100 
                        ? `${asset.description.substring(0, 100)}...` 
                        : asset.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="fw-bold">${asset.current_price}</div>
                        <small className="text-muted">
                            {new Date(asset.auction_end_time).toLocaleDateString()}
                        </small>
                    </div>
                    <Button 
                        variant="primary" 
                        size="sm"
                        as={Link}
                        href={route('buyer.assets.show', asset.id)}
                    >
                        View Details
                    </Button>
                </div>
                {asset.reason && (
                    <div className="mt-2">
                        <small className="text-muted">
                            <FiInfo className="me-1" />
                            {asset.reason}
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

const AIRecCard = ({ asset }) => {
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
            <Card className="border-0 shadow-sm h-100 ai-recommendation-card">
                <div className="position-relative">
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
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-2">
                        <FiTrendingUp className="me-1" /> AI Recommended
                    </Badge>
                </div>
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

const Dashboard = () => {
    const { props } = usePage();
    const { 
        activeBids = [], 
        watchlist: initialWatchlist = [], 
        notifications = [], 
        recentAssets = [], 
        auth,
        bidActivity = [],
        stats
    } = props;
    
    const [bids, setBids] = useState(activeBids);
    const [newNotifications, setNewNotifications] = useState(notifications);
    const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read_at).length);
    const [watchlist, setWatchlist] = useState(initialWatchlist);
    const [loading, setLoading] = useState(false);
    const [bidStats, setBidStats] = useState({
        totalBids: 0,
        activeBids: 0,
        wonBids: 0,
        lostBids: 0
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('overview');
    const [timeFilter, setTimeFilter] = useState('week');
    const [aiRecommendations, setAiRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);

    useEffect(() => {
        if (auth?.user?.id && window.Echo) {
            const echo = window.Echo;
            echo.private(`private-user.${auth.user.id}`)
                .listen('BidUpdated', (data) => {
                    setBids(prev => prev.map(bid => 
                        bid.id === data.id ? { ...bid, ...data } : bid
                    ));
                })
                .listen('AuctionEnded', (data) => {
                    setNewNotifications(prev => [{
                        id: Date.now(),
                        message: `Auction for ${data.asset_name} ended. ${data.won ? 'You won!' : 'Outbid'}`,
                        read_at: null,
                        created_at: new Date().toISOString()
                    }, ...prev]);
                    setUnreadCount(prev => prev + 1);
                })
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

    useEffect(() => {
        const fetchBidStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route('buyer.bids.stats'));
                setBidStats(response.data);
            } catch (error) {
                console.error('Error fetching bid stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBidStats();
    }, []);

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoadingRecommendations(true);
                const response = await axios.get(route('buyer.recommendations'));
                if (response.data && Array.isArray(response.data)) {
                    setAiRecommendations(response.data);
                } else {
                    console.error('Invalid recommendations data format:', response.data);
                    toast.error('Invalid recommendations data received');
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                toast.error('Failed to load recommendations. Please try again later.');
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, []);

    const markAsRead = (id) => {
        setNewNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
    };

    const refreshData = async () => {
        setLoadingRecommendations(true);
        try {
            const response = await axios.get(route('buyer.recommendations'));
            if (response.data && Array.isArray(response.data)) {
                setAiRecommendations(response.data);
                toast.success('Recommendations refreshed');
            } else {
                console.error('Invalid recommendations data format:', response.data);
                toast.error('Invalid recommendations data received');
            }
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
            toast.error('Failed to refresh recommendations');
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const renderOverview = () => (
        <>
            {/* Quick Stats */}
            <Row className="mb-4 g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 stat-card">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <div className="stat-icon bg-primary">
                                    <FiDollarSign size={20} />
                                </div>
                                <div>
                                    <h5 className="mb-0 text-muted">Active Bids</h5>
                                    <h3 className="mb-0">{bids.length}</h3>
                                </div>
                            </div>
                            <Link 
                                href={route('buyer.bids.index')} 
                                className="btn btn-sm btn-outline-primary mt-auto"
                            >
                                View Details <FiArrowRight className="ms-2" />
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 stat-card">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <div className="stat-icon bg-success">
                                    <FiEye size={20} />
                                </div>
                                <div>
                                    <h5 className="mb-0 text-muted">Watchlist Items</h5>
                                    <h3 className="mb-0">{watchlist.length}</h3>
                                </div>
                            </div>
                            <Link 
                                href={route('buyer.watchlist')} 
                                className="btn btn-sm btn-outline-success mt-auto"
                            >
                                View Details <FiArrowRight className="ms-2" />
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 stat-card">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <div className="stat-icon bg-info">
                                    <FiAward size={20} />
                                </div>
                                <div>
                                    <h5 className="mb-0 text-muted">Won Auctions</h5>
                                    <h3 className="mb-0">{bidStats.wonBids}</h3>
                                </div>
                            </div>
                            <Link 
                                href={route('buyer.bids.won')} 
                                className="btn btn-sm btn-outline-info mt-auto"
                            >
                                View Details <FiArrowRight className="ms-2" />
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row className="mb-4 g-4">
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="d-flex align-items-center mb-0">
                                    <FiTrendingUp className="me-2 text-primary" />
                                    Bid Activity
                                </Card.Title>
                                <div className="btn-group">
                                    <Button 
                                        variant={timeFilter === 'week' ? 'primary' : 'outline-primary'} 
                                        size="sm"
                                        onClick={() => setTimeFilter('week')}
                                    >
                                        Week
                                    </Button>
                                    <Button 
                                        variant={timeFilter === 'month' ? 'primary' : 'outline-primary'} 
                                        size="sm"
                                        onClick={() => setTimeFilter('month')}
                                    >
                                        Month
                                    </Button>
                                    <Button 
                                        variant={timeFilter === 'year' ? 'primary' : 'outline-primary'} 
                                        size="sm"
                                        onClick={() => setTimeFilter('year')}
                                    >
                                        Year
                                    </Button>
                                </div>
                            </div>
                            <div style={{ height: '300px' }}>
                                <BidActivityChart bidActivity={bidActivity} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <Card.Title className="d-flex align-items-center mb-3">
                                <FiTrendingUp className="me-2 text-primary" />
                                Price Distribution
                            </Card.Title>
                            <div style={{ height: '300px' }}>
                                <PriceDistributionChart assets={watchlist} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="d-flex align-items-center mb-0">
                                    <FiClock className="me-2 text-warning" />
                                    Recent Bids
                                </Card.Title>
                                <Link 
                                    href={route('buyer.bids.index')} 
                                    className="btn btn-sm btn-outline-primary"
                                >
                                    View All
                                </Link>
                            </div>
                            {bids.length > 0 ? (
                                <ListGroup variant="flush">
                                    {bids.slice(0, 5).map(bid => (
                                        <ListGroup.Item key={bid.id} className="px-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <Link href={`/buyer/assets/${bid.asset_id}`} className="text-decoration-none">
                                                        {bid.asset_name}
                                                    </Link>
                                                    <div className="text-muted small">
                                                        Ksh {bid.amount.toLocaleString()} · {format(new Date(bid.created_at), 'MMM d, h:mm a')}
                                                    </div>
                                                </div>
                                                <Badge bg={bid.is_winning ? "success" : "secondary"}>
                                                    {bid.is_winning ? "Winning" : "Outbid"}
                                                </Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <FiAlertCircle className="text-muted mb-2" size={24} />
                                    <p className="text-muted mb-0">No recent bids</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="d-flex align-items-center mb-0">
                                    <FiEye className="me-2 text-success" />
                                    Watchlist
                                </Card.Title>
                                <Link 
                                    href={route('buyer.watchlist')} 
                                    className="btn btn-sm btn-outline-success"
                                >
                                    View All
                                </Link>
                            </div>
                            {watchlist.length > 0 ? (
                                <ListGroup variant="flush">
                                    {watchlist.slice(0, 5).map(item => (
                                        <WatchlistItem key={item.id} item={item} />
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-4">
                                    <FiAlertCircle className="text-muted mb-2" size={24} />
                                    <p className="text-muted mb-0">No items in watchlist</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );

    const renderNotifications = () => (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title className="d-flex align-items-center mb-0">
                        <FiBell className="me-2 text-warning" />
                        Notifications
                    </Card.Title>
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={refreshData}
                    >
                        <FiTrendingUp className="me-1" /> Refresh
                    </Button>
                </div>
                {newNotifications.length > 0 ? (
                    <ListGroup variant="flush">
                        {newNotifications.map(notification => (
                            <NotificationItem 
                                key={notification.id} 
                                notification={notification} 
                                markAsRead={markAsRead} 
                            />
                        ))}
                    </ListGroup>
                ) : (
                    <div className="text-center py-4">
                        <FiAlertCircle className="text-muted mb-2" size={24} />
                        <p className="text-muted mb-0">No notifications</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderRecommendations = () => (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="mb-1 d-flex align-items-center">
                            <FiTrendingUp className="me-2 text-primary" />
                            AI-Powered Recommendations
                        </h4>
                        <p className="text-muted mb-0">
                            Personalized suggestions based on your interests and bidding history
                        </p>
                    </div>
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={refreshData}
                        disabled={loadingRecommendations}
                    >
                        {loadingRecommendations ? (
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        ) : (
                            <FiTrendingUp className="me-1" />
                        )}
                        Refresh
                    </Button>
                </div>
                
                {loadingRecommendations ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading recommendations...</span>
                        </Spinner>
                    </div>
                ) : aiRecommendations.length > 0 ? (
                    <Row>
                        {aiRecommendations.map((asset) => (
                            <Col lg={4} md={6} className="mb-4" key={asset.id}>
                                <Card className="border-0 shadow-sm h-100 ai-recommendation-card">
                                    <div className="position-relative">
                                        <Card.Img
                                            variant="top"
                                            src={asset.image_url || '/images/placeholder.jpg'}
                                            alt={asset.name}
                                            style={{ height: "200px", objectFit: "cover" }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                        <Badge bg="primary" className="position-absolute top-0 end-0 m-2">
                                            <FiTrendingUp className="me-1" /> AI Recommended
                                        </Badge>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-3">
                                            <Link 
                                                href={`/buyer/assets/${asset.id}`} 
                                                className="text-decoration-none"
                                            >
                                                <h5 className="mb-1">{asset.name}</h5>
                                            </Link>
                                            <p className="text-muted small mb-2">
                                                {asset.description?.substring(0, 100)}...
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-primary fw-bold">
                                                        Ksh {asset.current_price?.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <div className="small text-muted">Time Left</div>
                                                    <div className="fw-bold">
                                                        {format(new Date(asset.auction_end_time), 'MMM d, h:mm a')}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Recommendation Explanation */}
                                            <div className="mt-3 p-2 bg-light rounded">
                                                <small className="text-muted d-flex align-items-center">
                                                    <FiAward className="me-1 text-warning" />
                                                    <span>{asset.reason}</span>
                                                </small>
                                            </div>
                                        </div>
                                        <div className="mt-auto">
                                            <Link 
                                                href={`/buyer/assets/${asset.id}`}
                                                className="btn btn-primary w-100"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-4">
                        <FiAlertCircle className="text-muted mb-2" size={24} />
                        <p className="text-muted mb-0">No recommendations available</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <BuyerLayout>
            <Head title="Dashboard" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">Your Dashboard</h3>
                    <div className="d-flex align-items-center">
                        <div className="me-3 text-end">
                            <small className="text-muted d-block">Current Time</small>
                            <span className="fw-bold">{format(currentTime, 'h:mm:ss a')}</span>
                        </div>
                        <div className="text-end">
                            <small className="text-muted d-block">Today</small>
                            <span className="fw-bold">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="nav-tabs-custom">
                        <button 
                            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            Notifications
                            {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount}</Badge>}
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recommendations')}
                        >
                            Recommendations
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' ? renderOverview() : activeTab === 'notifications' ? renderNotifications() : renderRecommendations()}
            </Container>
        </BuyerLayout>
    );
};

export default Dashboard;