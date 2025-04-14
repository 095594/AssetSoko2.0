import { useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Toast({ toast }) {
    if (!toast) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-500' :
                    toast.type === 'error' ? 'bg-red-500' :
                    toast.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                } text-white`}
            >
                <h3 className="font-semibold">{toast.title}</h3>
                <p className="text-sm">{toast.message}</p>
            </motion.div>
        </AnimatePresence>
    );
} 