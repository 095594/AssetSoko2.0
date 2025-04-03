import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, Form, Button, Alert } from "react-bootstrap";

export default function Index({ settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        site_name: settings.site_name,
        site_description: settings.site_description,
        contact_email: settings.contact_email,
        currency: settings.currency,
        timezone: settings.timezone,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Settings</h1>
                </div>

                {recentlySuccessful && (
                    <Alert variant="success" className="mb-4">
                        Settings updated successfully.
                    </Alert>
                )}

                <Card className="shadow mb-4">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Site Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={data.site_name}
                                    onChange={(e) => setData('site_name', e.target.value)}
                                    isInvalid={errors.site_name}
                                />
                                {errors.site_name && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.site_name}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Site Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={data.site_description}
                                    onChange={(e) => setData('site_description', e.target.value)}
                                    isInvalid={errors.site_description}
                                />
                                {errors.site_description && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.site_description}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Contact Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    isInvalid={errors.contact_email}
                                />
                                {errors.contact_email && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.contact_email}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Currency</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    isInvalid={errors.currency}
                                />
                                {errors.currency && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.currency}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Timezone</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    isInvalid={errors.timezone}
                                />
                                {errors.timezone && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.timezone}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                Save Settings
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </AdminLayout>
    );
} 