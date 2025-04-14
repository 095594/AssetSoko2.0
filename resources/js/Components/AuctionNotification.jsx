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
        
        const channel = Echo.private(`private-user.${window.userId}`);
        
        channel.listen('.AuctionEndedBroadcast', (data) => {
            console.log('Received auction ended event:', data);
            
            let title, message;
            switch(data.type) {
                case 'winner':
                    title = 'Congratulations! You Won the Auction';
                    message = `You won the auction for ${data.asset.name} with a bid of Ksh ${data.winningBid.amount}`;
                    break;
                case 'outbid':
                    title = 'Auction Ended';
                    message = `The auction for ${data.asset.name} has ended. Unfortunately, you were outbid.`;
                    break;
                case 'seller':
                    title = 'Your Auction Has Ended';
                    message = data.winningBid 
                        ? `Your auction for ${data.asset.name} has ended. The winning bid was Ksh ${data.winningBid.amount}`
                        : `Your auction for ${data.asset.name} has ended with no bids`;
                    break;
                default:
                    return;
            }
            
            if (data.type === 'winner') {
                setShowPopup(true);
                setPopupData({
                    title,
                    message,
                    asset: data.asset,
                    winningBid: data.winningBid.amount,
                    details: {
                        payment_due: 'Payment is due within 24 hours'
                    }
                });
            }
            
            showToast({
                title,
                message,
                type: data.type === 'outbid' ? 'info' : 'success'
            });
        });

        return () => {
            console.log('Cleaning up Echo listener');
            channel.stopListening('.AuctionEndedBroadcast');
        };
    }, [showToast]);

    const handleProceedToPayment = () => {
        if (popupData?.asset) {
            navigate(`/payments/create?asset=${popupData.asset.id}`);
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