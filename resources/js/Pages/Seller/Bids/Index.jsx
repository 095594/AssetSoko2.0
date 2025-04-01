import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Row, Col, Badge, Button, Table } from "react-bootstrap";
import { FiClock, FiDollarSign, FiEye } from "react-icons/fi";

const BidRow = ({ bid }) => {
    const timeLeft = new Date(bid.asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const isActive = hoursLeft > 0;

    return (
        <tr>
            <td>
                <div className="d-flex align-items-center">
                    <img 
                        src={bid.asset.photos ? JSON.parse(bid.asset.photos)[0] : '/images/fallback.jpg'} 
                        alt={bid.asset.name}
                        className="rounded me-2"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                        <div className="fw-bold">{bid.asset.name}</div>
                        <div className="text-muted small">{bid.asset.category}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="fw-bold">{bid.user.name}</div>
                <div className="text-muted small">{bid.user.email}</div>
            </td>
            <td>
                <div className="fw-bold">Ksh {bid.amount.toLocaleString()}</div>
                <div className="text-muted small">
                    {new Date(bid.created_at).toLocaleString()}
                </div>
            </td>
            <td>
                <Badge bg={isActive ? "success" : "secondary"}>
                    <FiClock /> {hoursLeft}h left
                </Badge>
            </td>
            <td>
                <Link 
                    href={route('seller.bids.show', bid.id)}
                    className="btn btn-sm btn-outline-primary"
                >
                    <FiEye />
                </Link>
            </td>
        </tr>
    );
};

const BidList = ({ bids }) => {
    return (
        <BuyerLayout>
            <Head title="Asset Bids" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Asset Bids</h3>
                </div>

                {bids.data.length === 0 ? (
                    <Card className="text-center">
                        <Card.Body>
                            <h5>No bids received yet</h5>
                            <p className="text-muted">
                                Bids will appear here when buyers place them on your assets
                            </p>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Bidder</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bids.data.map(bid => (
                                        <BidRow key={bid.id} bid={bid} />
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {bids.links.length > 3 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <nav>
                                        <ul className="pagination">
                                            {bids.links.map((link, index) => (
                                                <li 
                                                    key={index}
                                                    className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                                >
                                                    <Link 
                                                        href={link.url}
                                                        className="page-link"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </BuyerLayout>
    );
};

export default BidList; 