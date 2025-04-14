import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AuctionWinnerModal from '../AuctionWinnerModal';

// Mock @headlessui/react
jest.mock('@headlessui/react', () => ({
  Dialog: {
    Root: ({ children }) => children,
    Overlay: ({ children }) => children,
    Title: ({ children }) => <h3>{children}</h3>
  },
  Transition: {
    Root: ({ show, children }) => show ? children : null,
    Child: ({ children }) => children
  }
}));

describe('AuctionWinnerModal', () => {
  const mockAsset = {
    name: 'Test Asset',
    id: 1
  };

  const mockWinningBid = {
    amount: 1000.00,
    payment_url: '/payment/1'
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <AuctionWinnerModal
        isOpen={true}
        onClose={mockOnClose}
        asset={mockAsset}
        winningBid={mockWinningBid}
      />
    );

    expect(screen.getByText('Congratulations! You Won the Auction')).toBeInTheDocument();
    expect(screen.getByText(/Test Asset/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,000.00/)).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(
      <AuctionWinnerModal
        isOpen={false}
        onClose={mockOnClose}
        asset={mockAsset}
        winningBid={mockWinningBid}
      />
    );

    expect(screen.queryByText('Congratulations! You Won the Auction')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <AuctionWinnerModal
        isOpen={true}
        onClose={mockOnClose}
        asset={mockAsset}
        winningBid={mockWinningBid}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('redirects to payment URL when Proceed to Payment is clicked', () => {
    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(
      <AuctionWinnerModal
        isOpen={true}
        onClose={mockOnClose}
        asset={mockAsset}
        winningBid={mockWinningBid}
      />
    );

    fireEvent.click(screen.getByText('Proceed to Payment'));
    expect(window.location.href).toBe('/payment/1');
  });
});
