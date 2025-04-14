import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AuctionEndedToast from '../AuctionEndedToast';

// Mock @headlessui/react
jest.mock('@headlessui/react', () => ({
  Transition: ({ show, children }) => show ? children : null
}));

describe('AuctionEndedToast', () => {
  const mockAsset = {
    name: 'Test Asset'
  };

  it('renders when show is true', () => {
    const { getByText } = render(
      <AuctionEndedToast
        show={true}
        onClose={() => {}}
        asset={mockAsset}
      />
    );

    expect(getByText('Auction Ended')).toBeInTheDocument();
    expect(getByText(`The auction for ${mockAsset.name} has ended. Better luck next time!`)).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    const { queryByText } = render(
      <AuctionEndedToast
        show={false}
        onClose={() => {}}
        asset={mockAsset}
      />
    );

    expect(queryByText('Auction Ended')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    const { getByRole } = render(
      <AuctionEndedToast
        show={true}
        onClose={mockOnClose}
        asset={mockAsset}
      />
    );

    fireEvent.click(getByRole('button'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
