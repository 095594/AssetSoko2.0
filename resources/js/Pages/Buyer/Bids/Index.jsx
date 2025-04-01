import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Table, Row, Col, Badge, Button, Spinner } from "react-bootstrap";
import { FiClock, FiDollarSign, FiTrendingUp, FiArrowLeft } from "react-icons/fi";

const BidRow = ({ bid }) => {
    const timeLeft = new Date(bid.asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const isLeading = bid.amount >= bid.current_bid;

    return (
        <tr className="align-middle">
            <td>
                <Link href={`/buyer/assets/${bid.asset_id}`} className="text-decoration-none">
                    {bid.asset.name}
                </Link>
            </td>
            <td>
                <span className="fw-bold">Ksh {bid.amount.toLocaleString()}</span>
            </td>
            <td>
                <span className="text-muted">Ksh {bid.current_bid.toLocaleString()}</span>
            </td>
            <td>
                <Badge bg={hoursLeft < 24 ? "danger" : "warning"} className="d-flex align-items-center">
                    <FiClock className="me-1" /> {hoursLeft}h
                </Badge>
            </td>
            <td>
                {isLeading ? (
                    <Badge bg="success" className="d-flex align-items-center">
                        <FiTrendingUp className="me-1" /> Leading
                    </Badge>
                ) : (
                    <Badge bg="secondary">Outbid</Badge>
                )}
            </td>
        </tr>
    );
};

const ActiveBids = () => {
    const { props } = usePage();
    const { activeBids = [], auth } = props;
    const [bids, setBids] = useState(activeBids);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth?.user?.id && window.Echo) {
            const echo = window.Echo;
            echo.private(`private-user.${auth.user.id}`)
                .listen('BidUpdated', (data) => {
                    setBids(prev => prev.map(bid => 
                        bid.id === data.id ? { ...bid, ...data } : bid
                    ));
                });

            return () => {
                echo.leave(`private-user.${auth.user.id}`);
            };
        }
    }, [auth?.user?.id]);

    return (
        <BuyerLayout>
            <Head title="Active Bids" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">Active Bids</h3>
                        <p className="text-muted mb-0">Track your current bidding activity</p>
                    </div>
                    <Link href={route('buyer.dashboard')} className="btn btn-outline-secondary">
                        <FiArrowLeft className="me-2" /> Back to Dashboard
                    </Link>
                </div>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : bids.length > 0 ? (
                            <Table hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Your Bid</th>
                                        <th>Current Bid</th>
                                        <th>Time Left</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bids.map((bid) => (
                                        <BidRow key={bid.id} bid={bid} />
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center py-5">
                                <FiDollarSign className="display-4 text-muted mb-3" />
                                <h5>No active bids</h5>
                                <p className="text-muted">You haven't placed any bids on active auctions yet.</p>
                                <Link href={route('buyer.assets.index')} className="btn btn-primary">
                                    Browse Assets
                                </Link>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </BuyerLayout>
    );
};

export default ActiveBids; 