import React, { createContext, useContext, useState, useEffect } from 'react';
import AuctionWinnerModal from '../Components/AuctionWinnerModal';
import AuctionEndedToast from '../Components/AuctionEndedToast';

export const AuctionNotificationContext = createContext();

export const useAuctionNotifications = () => {
  const context = useContext(AuctionNotificationContext);
  if (!context) {
    throw new Error('useAuctionNotifications must be used within an AuctionNotificationProvider');
  }
  return context;
};

export const AuctionNotificationProvider = ({ children }) => {
  const [winnerModalData, setWinnerModalData] = useState({ isOpen: false, asset: null, winningBid: null });
  const [toastData, setToastData] = useState({ show: false, asset: null, type: null, winningBid: null });

  useEffect(() => {
    if (!window.Echo) {
      console.error('Laravel Echo is not initialized');
      return;
    }

    if (!window.userId) {
      console.error('User ID is not available');
      return;
    }

    // Listen for auction notifications from Echo
    const handleAuctionNotification = (event) => {
      console.log('Received auction notification:', event.detail);
      
      if (event.detail.type === 'winner') {
        setWinnerModalData({
          isOpen: true,
          asset: event.detail.asset,
          winningBid: event.detail.winningBid
        });
      } else if (event.detail.type === 'seller' || event.detail.type === 'outbid') {
        setToastData({
          show: true,
          asset: event.detail.asset,
          type: event.detail.type,
          winningBid: event.detail.winningBid
        });
      }
    };

    window.addEventListener('auction-notification', handleAuctionNotification);

    return () => {
      window.removeEventListener('auction-notification', handleAuctionNotification);
    };
  }, []);

  const closeWinnerModal = () => {
    setWinnerModalData(prev => ({ ...prev, isOpen: false }));
  };

  const closeToast = () => {
    setToastData(prev => ({ ...prev, show: false }));
  };

  return (
    <AuctionNotificationContext.Provider value={{ winnerModalData, toastData, closeWinnerModal, closeToast }}>
      {children}
      <AuctionWinnerModal
        isOpen={winnerModalData.isOpen}
        onClose={closeWinnerModal}
        asset={winnerModalData.asset}
        winningBid={winnerModalData.winningBid}
      />
      <AuctionEndedToast
        show={toastData.show}
        onClose={closeToast}
        asset={toastData.asset}
        type={toastData.type}
        winningBid={toastData.winningBid}
      />
    </AuctionNotificationContext.Provider>
  );
};
