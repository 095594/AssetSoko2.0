import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Table, Button, Badge, Pagination } from "react-bootstrap";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function Index({ orders }) {
    return (
        <AdminLayout>
            <Head title="Orders" />

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Orders</h1>
                    <Button variant="primary">
                        Create Order
                    </Button>
                </div>

                <div className="card shadow mb-4">
                    <div className="card-body">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data?.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.user?.name}</td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>${order.total.toFixed(2)}</td>
                                            <td>
                                                <Badge bg={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                >
                                                    <FiEye />
                                                </Button>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                >
                                                    <FiEdit />
                                    </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                >
                                                    <FiTrash2 />
                                    </Button>
                                            </td>
                                        </tr>
                        ))}
                                </tbody>
                </Table>
            </div>

            {/* Pagination */}
                        {orders.links && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    {orders.links.map((link, index) => (
                                        <Pagination.Item
                                            key={index}
                                            active={link.active}
                                            disabled={!link.url}
                                            as={Link}
                                            href={link.url}
                                        >
                                            {link.label === '&laquo; Previous' ? '«' : 
                                             link.label === 'Next &raquo;' ? '»' : 
                                             link.label}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}