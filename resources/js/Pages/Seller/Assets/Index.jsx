import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Row, Col, Badge, Button, Table, Alert } from "react-bootstrap";
import { FiClock, FiDollarSign, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssetRow = ({ asset, onDelete }) => {
    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const isActive = hoursLeft > 0;

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            onDelete(asset.id);
        }
    };

    return (
        <tr>
            <td>
                <div className="d-flex align-items-center">
                    <img 
                        src={asset.photos ? JSON.parse(asset.photos)[0] : '/images/fallback.jpg'} 
                        alt={asset.name}
                        className="rounded me-2"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                        <div className="fw-bold">{asset.name}</div>
                        <div className="text-muted small">{asset.category}</div>
                    </div>
                </div>
            </td>
            <td>
                <div>Base: Ksh {asset.base_price.toLocaleString()}</div>
                <div className="text-muted small">
                    Current: Ksh {asset.current_price?.toLocaleString() || asset.base_price.toLocaleString()}
                </div>
            </td>
            <td>
                <Badge bg={isActive ? "success" : "secondary"}>
                    <FiClock /> {hoursLeft}h left
                </Badge>
            </td>
            <td>
                <div className="d-flex gap-2">
                    <Link 
                        href={route('seller.assets.edit', asset.id)}
                        className="btn btn-sm btn-outline-primary"
                    >
                        <FiEdit2 />
                    </Link>
                    <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={handleDelete}
                    >
                        <FiTrash2 />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const AssetList = ({ assets }) => {
    const handleDelete = async (assetId) => {
        try {
            await router.delete(route('seller.assets.destroy', assetId));
            toast.success('Asset deleted successfully');
        } catch (error) {
            toast.error('Failed to delete asset');
        }
    };

    return (
        <BuyerLayout>
            <Head title="My Assets" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>My Assets</h3>
                    <Link 
                        href={route('seller.assets.create')}
                        className="btn btn-primary"
                    >
                        <FiPlus className="me-2" />
                        List New Asset
                    </Link>
                </div>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                {assets.data.length === 0 ? (
                    <Card className="text-center">
                        <Card.Body>
                            <h5>No assets listed yet</h5>
                            <p className="text-muted">
                                Start by listing your first asset for auction
                            </p>
                            <Link 
                                href={route('seller.assets.create')}
                                className="btn btn-primary"
                            >
                                <FiPlus className="me-2" />
                                List New Asset
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.data.map(asset => (
                                        <AssetRow 
                                            key={asset.id} 
                                            asset={asset}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {assets.links.length > 3 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <nav>
                                        <ul className="pagination">
                                            {assets.links.map((link, index) => (
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

export default AssetList; 