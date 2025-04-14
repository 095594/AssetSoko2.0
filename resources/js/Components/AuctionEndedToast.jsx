import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AuctionEndedToast = ({ show, onClose, asset, type, winningBid }) => {
  if (!asset) return null;

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'seller':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'seller':
        return `Your auction for ${asset.name} has ended. Winning bid: KES ${formatPrice(winningBid?.amount)}`;
      case 'outbid':
        return `The auction for ${asset.name} has ended. Better luck next time!`;
      default:
        return `The auction for ${asset.name} has ended.`;
    }
  };

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                Auction Ended
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {getMessage()}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default AuctionEndedToast;
