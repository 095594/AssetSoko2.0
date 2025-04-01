import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = ({ transactionId }) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(1);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/feedback', {
                transaction_id: transactionId,
                comment,
                rating,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setMessage('Feedback submitted successfully!');
        } catch (error) {
            setMessage('Failed to submit feedback. Please try again.');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Leave your feedback"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Rating (1-5)"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                required
            />
            <button type="submit">Submit Feedback</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default FeedbackForm;