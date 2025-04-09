import React, { useEffect, useState } from 'react';
import { useToast } from '../Hooks/useToast';
import { useNavigate } from 'react-router-dom';
import Echo from 'laravel-echo';

const AuctionNotification = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Setting up Echo listener for auction notifications');
        
        const channel = Echo.private(`App.Models.User.${window.authUser.id}`);
        
        channel.listen('AuctionCompleted', (data) => {
            console.log('Received auction completed event:', data);
            
            if (data.show_popup) {
                setShowPopup(true);
                setPopupData({
                    title: data.popup_title,
                    message: data.popup_message,
                    details: data.popup_details,
                    asset: data.asset,
                    winningBid: data.winning_bid
                });
            }
            
            showToast({
                title: data.popup_title,
                message: data.popup_message,
                type: 'success'
            });
        });

        return () => {
            console.log('Cleaning up Echo listener');
            channel.stopListening('AuctionCompleted');
        };
    }, [showToast]);

    const handleProceedToPayment = () => {
        if (popupData?.asset) {
            navigate(`/payments/initiate/${popupData.asset.id}`);
        }
        setShowPopup(false);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{popupData.title}</h3>
                    <button 
                        onClick={handleClosePopup}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="mb-4">
                    <img 
                        src={popupData.asset.image} 
                        alt={popupData.asset.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="font-semibold">Asset: {popupData.asset.name}</p>
                    <p className="font-semibold">Winning Bid: Ksh {popupData.winningBid}</p>
                    <p className="text-sm text-gray-600">{popupData.details.payment_due}</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClosePopup}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleProceedToPayment}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionNotification; 