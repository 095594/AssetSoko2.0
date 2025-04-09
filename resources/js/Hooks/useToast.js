import { useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ title, message, variant = 'info', duration = 3000 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, variant }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const ToastContainerComponent = () => (
        <ToastContainer position="top-end" className="p-3">
            {toasts.map(({ id, title, message, variant }) => (
                <Toast key={id} bg={variant} show={true} autohide>
                    <Toast.Header closeButton={false}>
                        <strong className="me-auto">{title}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">{message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );

    return { showToast, ToastContainerComponent };
}; 