import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Container, Card, Table, Button, Form, InputGroup, Badge, Row, Col, Pagination } from "react-bootstrap";
import { FiSearch, FiEdit, FiTrash2, FiUserPlus, FiFilter } from "react-icons/fi";

const UsersIndex = ({ users }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Access the data property of the paginated collection
    const usersData = users.data || [];

    const filteredUsers = usersData.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role, isAdmin) => {
        if (isAdmin) {
            return <Badge bg="danger">Admin</Badge>;
        }
        const variants = {
            buyer: "primary",
            seller: "success",
        };
        return <Badge bg={variants[role] || "secondary"}>{role}</Badge>;
    };

    const getStatusBadge = (status) => {
        const variants = {
            active: "success",
            inactive: "secondary",
            suspended: "danger",
        };
        return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
    };

    return (
        <AdminLayout>
            <Head title="Users Management" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Users Management</h3>
                                    <Button 
                        variant="primary"
                        href={route('admin.users.create')}
                    >
                        <FiUserPlus className="me-2" />
                        Add New User
                    </Button>
                </div>

                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text>
                                        <FiSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text>
                                        <FiFilter />
                                    </InputGroup.Text>
                                    <Form.Select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="buyer">Buyer</option>
                                        <option value="seller">Seller</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Active</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div>
                                                    <strong>{user.name}</strong>
                                                    <div className="text-muted small">{user.email}</div>
                                                </div>
                                            </td>
                                            <td>{getRoleBadge(user.role, user.is_admin)}</td>
                                            <td>{getStatusBadge(user.status)}</td>
                                            <td>
                                                {user.last_active
                                                    ? new Date(user.last_active).toLocaleString()
                                                    : 'Never'}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    href={route('admin.users.edit', user.id)}
                                                >
                                                    <FiEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this user?')) {
                                                            // Handle delete
                                                        }
                                                    }}
                                                >
                                                    <FiTrash2 />
                                    </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                </Table>

            {/* Pagination */}
                        {users.links && users.links.length > 0 && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    {users.links.map((link, index) => {
                                        // Skip rendering if there's no URL
                                        if (!link.url) {
                                            return (
                                                <Pagination.Item
                                                    key={index}
                                                    disabled
                                                    active={link.active}
                                                >
                                                    {link.label}
                                                </Pagination.Item>
                                            );
                                        }

                                        // For links with URLs, render as a link
                                        return (
                                            <Pagination.Item
                                                key={index}
                                                active={link.active}
                                                href={link.url}
                                            >
                                                {link.label}
                                            </Pagination.Item>
                                        );
                                    })}
                                </Pagination>
                </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </AdminLayout>
    );
};

export default UsersIndex;
