import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiCamera, FiLock, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data, setData, patch, errors, processing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        address: auth.user.address || '',
        profile_picture: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setUploadProgress(0);
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        patch(route('profile.update'), {
            preserveScroll: true,
            onProgress: (progress) => {
                setUploadProgress(progress.percentage);
            },
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setPreviewImage(null);
                setUploadProgress(0);
            },
            onError: () => {
                toast.error('Failed to update profile. Please try again.');
                setUploadProgress(0);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title="Profile Settings" />

            <div className="py-12">
                <Container>
                    <div className="d-flex align-items-center mb-4">
                        <Button
                            variant="link"
                            className="text-decoration-none d-flex align-items-center"
                            onClick={() => window.history.back()}
                        >
                            <FiArrowLeft className="me-2" />
                            Back
                        </Button>
                        <h2 className="mb-0 ms-3">Profile Settings</h2>
                    </div>

                    <ToastContainer position="top-right" autoClose={3000} />
                    
                    {status && (
                        <Alert variant="success" className="mb-4">
                            {status}
                        </Alert>
                    )}

                    <Row>
                        <Col lg={4} className="mb-4">
                            <Card className="border-0 shadow-sm profile-card">
                                <Card.Body className="text-center p-4">
                                    <div className="position-relative d-inline-block mb-3">
                                        <div className="profile-image-container">
                                            {previewImage ? (
                                                <img 
                                                    src={previewImage} 
                                                    alt="Profile Preview" 
                                                    className="profile-image"
                                                />
                                            ) : (
                                                <div className="profile-image-placeholder">
                                                    {auth.user.profile_photo_url ? (
                                                        <img 
                                                            src={auth.user.profile_photo_url} 
                                                            alt="Profile" 
                                                            className="profile-image"
                                                        />
                                                    ) : (
                                                        <span className="initials">
                                                            {auth.user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <Button
                                                variant="light"
                                                className="change-photo-btn"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <FiCamera />
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="d-none"
                                        />
                                    </div>
                                    <h4 className="mb-1">{auth.user.name}</h4>
                                    <p className="text-muted mb-3">{auth.user.email}</p>
                                    {uploadProgress > 0 && (
                                        <ProgressBar 
                                            now={uploadProgress} 
                                            label={`${uploadProgress}%`}
                                            className="mb-3"
                                        />
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={8}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <h5 className="card-title mb-4">Personal Information</h5>
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
                                                disabled={processing}
                                                className="d-flex align-items-center justify-content-center"
                                            >
                                                <FiSave className="me-2" />
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Body className="p-4">
                                    <h5 className="card-title mb-4">Security</h5>
                                    <UpdatePasswordForm />
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Body className="p-4">
                                    <h5 className="card-title mb-4 text-danger">Danger Zone</h5>
                                    <DeleteUserForm />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            
            <style jsx>{`
                .profile-card {
                    border-radius: 12px;
                    overflow: hidden;
                }

                .profile-image-container {
                    width: 150px;
                    height: 150px;
                    position: relative;
                    margin: 0 auto;
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .profile-image-placeholder {
                    width: 100%;
                    height: 100%;
                    background-color: #4e73df;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .initials {
                    font-size: 48px;
                    color: white;
                    font-weight: bold;
                }

                .change-photo-btn {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

                .progress {
                    height: 8px;
                    border-radius: 4px;
                }

                .btn-link {
                    color: #4e73df;
                    padding: 0;
                }

                .btn-link:hover {
                    color: #2e59d9;
                }
            `}</style>
        </div>
    );
}