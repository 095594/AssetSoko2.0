import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout";
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from "react-bootstrap";
import { FiUpload, FiX, FiSave, FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

const EditAsset = ({ asset }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: asset.name || '',
        description: asset.description || '',
        category: asset.category || '',
        base_price: asset.base_price || '',
        reserve_price: asset.reserve_price || '',
        auction_end_time: asset.auction_end_time ? format(new Date(asset.auction_end_time), "yyyy-MM-dd'T'HH:mm") : '',
        condition: asset.condition || '',
        photos: []
    });

    const [previewImages, setPreviewImages] = useState(() => {
        try {
            return asset.photos ? (
                typeof asset.photos === 'string' ? 
                    JSON.parse(asset.photos).map(photo => `/storage/${photo}`) : 
                    asset.photos.map(photo => `/storage/${photo}`)
            ) : [];
        } catch (e) {
            console.error('Error parsing photos:', e);
            return [];
        }
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('seller.assets.update', asset.id), {
            onSuccess: () => {
                toast.success('Asset updated successfully');
            },
            onError: () => {
                toast.error('Failed to update asset');
            }
        });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setData('photos', files);

        // Create preview URLs for new photos
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prevImages => [...prevImages, ...newPreviewUrls]);
    };

    const removePhoto = (index) => {
        // Remove from preview images
        setPreviewImages(prevImages => prevImages.filter((_, i) => i !== index));

        // Remove from form data if it's a new photo
        if (index >= (asset.photos?.length || 0)) {
            const newPhotoIndex = index - (asset.photos?.length || 0);
            const newPhotos = [...data.photos];
            newPhotos.splice(newPhotoIndex, 1);
            setData('photos', newPhotos);
        }
    };

    const handleDelete = () => {
        router.delete(route('seller.assets.destroy', asset.id), {
            onSuccess: () => {
                toast.success('Asset deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete asset');
            }
        });
    };

    return (
        <BuyerLayout>
            <Head title="Edit Asset" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Edit Asset</h3>
                    <div>
                        <Button 
                            variant="outline-danger"
                            className="me-2"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <FiTrash2 className="me-2" />
                            Delete Asset
                        </Button>
                        <Button 
                            variant="outline-secondary"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
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
                                            <Form.Control
                                                type="text"
                                                value={data.category}
                                                onChange={e => setData('category', e.target.value)}
                                                isInvalid={errors.category}
                                            />
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
                                        rows={3}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        isInvalid={errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.description}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>

                            {/* Pricing */}
                            <div className="mb-4">
                                <h5 className="mb-3">Pricing</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Base Price (KSH)</Form.Label>
                                            <Form.Control
                                                type="number"
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
                                            <Form.Label>Reserve Price (KSH)</Form.Label>
                                            <Form.Control
                                                type="number"
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
                            </div>

                            {/* Auction Settings */}
                            <div className="mb-4">
                                <h5 className="mb-3">Auction Settings</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Date & Time</Form.Label>
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
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Condition</Form.Label>
                                            <Form.Select
                                                value={data.condition}
                                                onChange={e => setData('condition', e.target.value)}
                                                isInvalid={errors.condition}
                                            >
                                                <option value="">Select condition...</option>
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
                            </div>

                            {/* Photos */}
                            <div className="mb-4">
                                <h5 className="mb-3">Photos</h5>
                                <Form.Group>
                                    <div className="d-flex align-items-center mb-3">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => document.getElementById('photo-upload').click()}
                                        >
                                            <FiUpload className="me-2" />
                                            Add Photos
                                        </Button>
                                        <Form.Control
                                            type="file"
                                            id="photo-upload"
                                            className="d-none"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                        <small className="text-muted ms-3">
                                            You can upload multiple photos
                                        </small>
                                    </div>
                                    {errors.photos && (
                                        <Alert variant="danger">{errors.photos}</Alert>
                                    )}
                                    <div className="row g-3">
                                        {previewImages.map((url, index) => (
                                            <div key={index} className="col-md-3">
                                                <div className="position-relative">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="img-fluid rounded"
                                                        style={{ aspectRatio: '1', objectFit: 'cover' }}
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 m-2"
                                                        onClick={() => removePhoto(index)}
                                                    >
                                                        <FiX />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Form.Group>
                            </div>

                            {/* Submit Button */}
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
                                    Update Asset
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this asset? This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </BuyerLayout>
    );
};

export default EditAsset; 