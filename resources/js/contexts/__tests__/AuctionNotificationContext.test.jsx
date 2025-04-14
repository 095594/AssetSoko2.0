import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuctionNotificationProvider, useAuctionNotifications } from '../AuctionNotificationContext';

// Mock Echo
jest.mock('laravel-echo', () => {
  return function() {
    return {
      private: jest.fn().mockReturnThis(),
      listen: jest.fn().mockReturnThis(),
      leave: jest.fn()
    };
  };
});

describe('AuctionNotificationContext', () => {
  beforeEach(() => {
    // Mock window.userId
    window.userId = 1;
    // Reset all mocks before each test
    window.Echo.private.mockClear();
    window.Echo.listen.mockClear();
    window.Echo.leave.mockClear();
  });

  it('initializes Echo and listens for events', () => {
    render(
      <AuctionNotificationProvider>
        <div>Test</div>
      </AuctionNotificationProvider>
    );

    // Verify Echo was initialized and listening on the correct channel
    expect(window.Echo.private).toHaveBeenCalledWith('user.1');
    expect(window.Echo.listen).toHaveBeenCalledWith('AuctionEndedBroadcast', expect.any(Function));
  });

  it('shows winner modal when receiving winner event', () => {
    const TestComponent = () => {
      const { winnerModalData } = useAuctionNotifications();
      return winnerModalData ? <div>Winner Modal Visible</div> : null;
    };

    const { queryByText } = render(
      <AuctionNotificationProvider>
        <TestComponent />
      </AuctionNotificationProvider>
    );

    // Simulate receiving a winner event
    act(() => {
      const listenCallback = window.Echo.listen.mock.calls[0][1];
      listenCallback({
        type: 'winner',
        asset: { name: 'Test Asset' },
        winningBid: { amount: 1000 }
      });
    });

    expect(queryByText('Winner Modal Visible')).toBeInTheDocument();
  });

  it('shows toast when receiving outbid event', () => {
    const TestComponent = () => {
      const { toastData } = useAuctionNotifications();
      return toastData ? <div>Toast Visible</div> : null;
    };

    const { queryByText } = render(
      <AuctionNotificationProvider>
        <TestComponent />
      </AuctionNotificationProvider>
    );

    // Simulate receiving an outbid event
    act(() => {
      const listenCallback = window.Echo.listen.mock.calls[0][1];
      listenCallback({
        type: 'outbid',
        asset: { name: 'Test Asset' }
      });
    });

    expect(queryByText('Toast Visible')).toBeInTheDocument();
  });
});
