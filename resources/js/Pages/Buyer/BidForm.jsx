import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

const BidForm = ({ auctionId }) => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/bids', {
                auction_id: auctionId,
                amount: parseFloat(amount),
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setMessage('Bid placed successfully!');
        } catch (error) {
            setMessage('Failed to place bid. Please try again.');
            console.error(error);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Bid Amount</Form.Label>
                <Form.Control
                    type="number"
                    placeholder="Enter bid amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Place Bid
            </Button>
            {message && <p className="mt-3">{message}</p>}
        </Form>
    );
};

export default BidForm;