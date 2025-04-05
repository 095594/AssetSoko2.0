import React from 'react';
import { Head } from '@inertiajs/react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import { FiAward, FiDollarSign, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import BuyerLayout from '@/Layouts/BuyerLayout';

const Won = ({ wonAssets, darkMode }) => {
    return (
        <BuyerLayout>
            <Head title="Won Auctions" />
            
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 mb-0">
                        <FiAward className="me-2 text-warning" />
                        Won Auctions
                    </h1>
                </div>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        {wonAssets.length > 0 ? (
                            <Table responsive hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Final Price</th>
                                        <th>Seller</th>
                                        <th>End Date</th>
                                        <th>Bids</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wonAssets.map((asset) => (
                                        <tr key={asset.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{asset.name}</div>
                                                        <small className="text-muted">{asset.description}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FiDollarSign className="me-1 text-success" />
                                                    <span className="fw-bold">
                                                        {asset.final_price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FiUser className="me-1 text-primary" />
                                                    {asset.seller.name}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FiClock className="me-1 text-muted" />
                                                    {format(new Date(asset.auction_end_time), 'MMM d, yyyy')}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="info" className="d-flex align-items-center">
                                                    {asset.your_bids} / {asset.total_bids}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center py-5">
                                <FiAward size={48} className="text-muted mb-3" />
                                <h5>No won auctions yet</h5>
                                <p className="text-muted">
                                    When you win an auction, it will appear here.
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </BuyerLayout>
    );
};

export default Won; 