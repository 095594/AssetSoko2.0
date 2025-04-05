import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { data, setData, patch, errors, processing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        address: auth.user.address || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        patch(route('profile.update'), {
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setTimeout(() => {
                    window.location.href = route('dashboard');
                }, 1500);
            },
            onError: () => {
                toast.error('Failed to update profile. Please try again.');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <ToastContainer position="top-right" autoClose={3000} />
                            
                            {status && (
                                <Alert variant="success" className="mb-4">
                                    {status}
                                </Alert>
                            )}

                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="text-center mb-4">
                                        <div className="avatar-circle mb-3">
                                            <span className="initials">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                </div>
                                        <h4 className="mb-0">{auth.user.name}</h4>
                                        <p className="text-muted">{auth.user.email}</p>
                            </div>

                                    <Form onSubmit={submit}>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="d-flex align-items-center">
                                                        <FiUser className="me-2" /> Name
                                                    </Form.Label>
                                                    <Form.Control
                                type="text"
                                value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        isInvalid={errors.name}
                                                        className="form-control-lg"
                            />
                            {errors.name && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.name}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="d-flex align-items-center">
                                                        <FiMail className="me-2" /> Email
                                                    </Form.Label>
                                                    <Form.Control
                                type="email"
                                value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        isInvalid={errors.email}
                                                        className="form-control-lg"
                            />
                            {errors.email && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.email}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="d-flex align-items-center">
                                                        <FiPhone className="me-2" /> Phone
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        isInvalid={errors.phone}
                                                        className="form-control-lg"
                                                    />
                                                    {errors.phone && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.phone}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="d-flex align-items-center">
                                                        <FiMapPin className="me-2" /> Address
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        isInvalid={errors.address}
                                                        className="form-control-lg"
                                                    />
                                                    {errors.address && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.address}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        <div className="d-grid gap-2 mt-4">
                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                size="lg"
                                                disabled={processing || isSubmitting}
                                                className="d-flex align-items-center justify-content-center"
                                            >
                                                <FiSave className="me-2" />
                                                {processing || isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    </div>
            </div>
            
            <style jsx>{`
                .avatar-circle {
                    width: 100px;
                    height: 100px;
                    background-color: #4e73df;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 auto;
                }
                
                .initials {
                    font-size: 40px;
                    color: white;
                    font-weight: bold;
                }
                
                .form-control-lg {
                    height: 50px;
                    font-size: 16px;
                    border-radius: 8px;
                }
                
                .btn-primary {
                    background-color: #4e73df;
                    border-color: #4e73df;
                    border-radius: 8px;
                    padding: 12px;
                }
                
                .btn-primary:hover {
                    background-color: #2e59d9;
                    border-color: #2e59d9;
                }
                
                .card {
                    border-radius: 12px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}