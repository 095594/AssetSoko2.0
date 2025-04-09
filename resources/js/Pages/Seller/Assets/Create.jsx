import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { FiUpload, FiX, FiSave } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateAsset = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category: '',
        base_price: '',
        reserve_price: '',
        auction_end_time: '',
        condition: '',
        photos: []
    });

    const [previewImages, setPreviewImages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format the auction end time to include timezone
        const formattedData = {
            ...data,
            auction_end_time: data.auction_end_time ? new Date(data.auction_end_time).toISOString() : null
        };

        post(route('seller.assets.store'), formattedData, {
            onSuccess: () => {
                toast.success('Asset listed successfully');
                reset();
                setPreviewImages([]);
            },
            onError: (errors) => {
                toast.error('Failed to list asset');
                console.error('Form errors:', errors);
            }
        });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = [...data.photos, ...files];
        
        // Validate file types and sizes
        const validFiles = newPhotos.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type);
            const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit
            return isValidType && isValidSize;
        });

        if (validFiles.length !== newPhotos.length) {
            toast.error('Some files were rejected. Please ensure all files are images under 2MB.');
            return;
        }

        setData('photos', validFiles);

        // Create preview URLs
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(newPreviews);
    };

    const removePhoto = (index) => {
        const newPhotos = data.photos.filter((_, i) => i !== index);
        setData('photos', newPhotos);
        
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(previewImages[index]);
        setPreviewImages(previewImages.filter((_, i) => i !== index));
    };

    return (
        <BuyerLayout>
            <Head title="List New Asset" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>List New Asset</h3>
                    <Button 
                        variant="outline-secondary"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                </div>

                <ToastContainer />

                <Card className="shadow-sm border-0">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="mb-4">
                                <h5 className="mb-3">Basic Information</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Asset Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                isInvalid={errors.name}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select
                                                value={data.category}
                                                onChange={e => setData('category', e.target.value)}
                                                isInvalid={errors.category}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="furniture">Furniture</option>
                                                <option value="vehicles">Vehicles</option>
                                                <option value="art">Art</option>
                                                <option value="jewelry">Jewelry</option>
                                                <option value="office equipment">Office Equipment</option>
                                                <option value="Musical Instruments">Musical Instruments</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.category}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        isInvalid={errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.description}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>

                            {/* Pricing & Duration */}
                            <div className="mb-4">
                                <h5 className="mb-3">Pricing & Duration</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Starting Price (Ksh)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.base_price}
                                                onChange={e => setData('base_price', e.target.value)}
                                                isInvalid={errors.base_price}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.base_price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reserve Price (Ksh)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min={data.base_price || 0}
                                                step="0.01"
                                                value={data.reserve_price}
                                                onChange={e => setData('reserve_price', e.target.value)}
                                                isInvalid={errors.reserve_price}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.reserve_price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Condition</Form.Label>
                                            <Form.Select
                                                value={data.condition}
                                                onChange={e => setData('condition', e.target.value)}
                                                isInvalid={errors.condition}
                                            >
                                                <option value="">Select Condition</option>
                                                <option value="new">New</option>
                                                <option value="used">Used</option>
                                                <option value="refurbished">Refurbished</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.condition}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Auction End Time</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={data.auction_end_time}
                                                onChange={e => setData('auction_end_time', e.target.value)}
                                                isInvalid={errors.auction_end_time}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.auction_end_time}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Photos */}
                            <div className="mb-4">
                                <h5 className="mb-3">Photos</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label>Upload Photos (Max 5)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        disabled={data.photos.length >= 5}
                                    />
                                    <Form.Text className="text-muted">
                                        You can upload up to 5 photos. Supported formats: JPG, PNG, GIF. Max size: 2MB per image.
                                    </Form.Text>
                                </Form.Group>

                                {previewImages.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="position-relative">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="rounded"
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-1"
                                                    onClick={() => removePhoto(index)}
                                                >
                                                    <FiX />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="d-flex align-items-center"
                                >
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <FiSave className="me-2" />
                                    )}
                                    List Asset
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </BuyerLayout>
    );
};

export default CreateAsset; 