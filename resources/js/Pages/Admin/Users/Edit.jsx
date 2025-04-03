import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { FiSave, FiUser, FiShield } from "react-icons/fi";

const UserEdit = ({ user }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const roles = [
        { id: 'buyer', name: 'Buyer' },
        { id: 'seller', name: 'Seller' },
        { id: 'admin', name: 'Admin' },
    ];

    return (
        <AdminLayout>
            <Head title={`Edit User - ${user.name}`} />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Edit User</h3>
                    <Button
                        variant="outline-secondary"
                        href={route('admin.users.index')}
                    >
                        Back to Users
                    </Button>
                    </div>

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            isInvalid={!!errors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                            type="email"
                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Select
                            value={data.role}
                                            onChange={e => setData('role', e.target.value)}
                                            isInvalid={!!errors.role}
                                        >
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.role}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Admin Access</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            id="admin-switch"
                                            label="Grant admin privileges"
                                            checked={data.is_admin}
                                            onChange={e => setData('is_admin', e.target.checked)}
                                        />
                                        <Form.Text className="text-muted">
                                            Admin users have full access to the platform's administrative features.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Alert variant="info" className="mb-4">
                                <FiShield className="me-2" />
                                <strong>Note:</strong> Changing a user's role or admin status will affect their access to various features of the platform. Please ensure this change is necessary and authorized.
                            </Alert>

                            <div className="d-flex justify-content-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                >
                                    <FiSave className="me-2" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </AdminLayout>
    );
};

export default UserEdit;
