import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Table, Row, Col, Badge, Button, ListGroup } from "react-bootstrap";
import { FiClock, FiDollarSign, FiEye, FiBell, FiShoppingCart, FiTrendingUp, FiBarChart2, FiPieChart, FiArrowRight } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

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
  Legend
);

const NotificationItem = ({ notification, markAsRead }) => (
    <ListGroup.Item 
        className="d-flex justify-content-between align-items-center"
        action
        onClick={() => markAsRead(notification.id)}
    >
        <div>
            <div>{notification.message}</div>
            <small className="text-muted">
                {new Date(notification.created_at).toLocaleString()}
            </small>
        </div>
        {!notification.read_at && <Badge bg="primary">New</Badge>}
    </ListGroup.Item>
);

const WatchlistItem = ({ item }) => {
    const timeLeft = new Date(item.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);

    return (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <div>
                <Link href={`/buyer/assets/${item.id}`} className="text-decoration-none">
                    {item.name}
                </Link>
                <div className="text-muted small">
                    {item.bids?.length || 0} bids · Current: Ksh {item.current_price?.toLocaleString() || item.base_price?.toLocaleString()}
                </div>
            </div>
            <Badge bg={hoursLeft < 24 ? "danger" : "warning"}>
                <FiClock /> {hoursLeft}h
            </Badge>
        </ListGroup.Item>
    );
};

const BidActivityChart = ({ bidActivity }) => {
  const data = {
    labels: bidActivity.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Bids Placed',
        data: bidActivity.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Bid Activity (Last 30 Days)',
      },
    },
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
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price Distribution in Your Watchlist',
      },
    },
  };

  return <Bar options={options} data={data} />;
};

const BidStatusChart = ({ bids }) => {
  const leadingBids = bids.filter(bid => bid.amount >= (bid.current_bid || 0)).length;
  const outbidBids = bids.length - leadingBids;

  const data = {
    labels: ['Leading Bids', 'Outbid'],
    datasets: [
      {
        label: 'Bid Status',
        data: [leadingBids, outbidBids],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Bid Status',
      },
    },
  };

  return <Pie options={options} data={data} />;
};

const Dashboard = () => {
    const { props } = usePage();
    const { 
        activeBids = [], 
        watchlist: initialWatchlist = [], 
        notifications = [], 
        recentAssets = [], 
        auth,
        bidActivity = [] 
    } = props;
    
    const [bids, setBids] = useState(activeBids);
    const [newNotifications, setNewNotifications] = useState(notifications);
    const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read_at).length);
    const [watchlist, setWatchlist] = useState(initialWatchlist);

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

    const markAsRead = (id) => {
        setNewNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
    };

    return (
        <BuyerLayout>
            <Head title="Dashboard" />
            <Container className="mt-4">
                <h3 className="mb-4">Dashboard Overview</h3>

                {/* Quick Stats */}
                <Row className="mb-4 g-4">
                    <Col md={4}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <FiDollarSign className="display-6 text-success me-3" />
                                    <div>
                                        <h5 className="mb-0">Active Bids</h5>
                                        <h3 className="mb-0">{bids.length}</h3>
                                    </div>
                                </div>
                                <Link 
                                    href={route('buyer.bids.index')} 
                                    className="btn btn-outline-success mt-auto"
                                >
                                    View Details <FiArrowRight className="ms-2" />
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <FiEye className="display-6 text-primary me-3" />
                                    <div>
                                        <h5 className="mb-0">Watchlist Items</h5>
                                        <h3 className="mb-0">{watchlist.length}</h3>
                                    </div>
                                </div>
                                <Link 
                                    href={route('buyer.watchlist')} 
                                    className="btn btn-outline-primary mt-auto"
                                >
                                    View Details <FiArrowRight className="ms-2" />
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center mb-3">
                                    <FiBell className="display-6 text-warning me-3" />
                                    <div>
                                        <h5 className="mb-0">Notifications</h5>
                                        <h3 className="mb-0">{unreadCount} New</h3>
                                    </div>
                                </div>
                                <Link 
                                    href={route('notifications.index')} 
                                    className="btn btn-outline-warning mt-auto"
                                >
                                    View Details <FiArrowRight className="ms-2" />
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Charts Section */}
                <Row className="mb-4 g-4">
                    <Col md={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center">
                                    <FiBarChart2 className="me-2 text-info" />
                                    Bid Activity
                                </Card.Title>
                                <div style={{ height: '300px' }}>
                                    <BidActivityChart bidActivity={bidActivity} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center">
                                    <FiPieChart className="me-2 text-primary" />
                                    Bid Status
                                </Card.Title>
                                <div style={{ height: '300px' }}>
                                    <BidStatusChart bids={bids} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </BuyerLayout>
    );
};

export default Dashboard;