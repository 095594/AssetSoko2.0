// Resources/js/Pages/Assets/Show.jsx
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { format } from 'date-fns';
import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, ClockIcon, TagIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function Show({ auth, asset }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [isWatching, setIsWatching] = useState(asset.is_watched || false);
    const [isToggling, setIsToggling] = useState(false);
    const [showBidSuccess, setShowBidSuccess] = useState(false);

    // Parse photos to ensure it's an array
    const photos = React.useMemo(() => {
        try {
            if (!asset.photos) return [];
            if (Array.isArray(asset.photos)) return asset.photos;
            return JSON.parse(asset.photos) || [];
        } catch (e) {
            console.error('Error parsing photos:', e);
            return [];
        }
    }, [asset.photos]);

    // Calculate minimum bid amount
    const minBid = React.useMemo(() => {
        if (asset.bids && asset.bids.length > 0) {
            const highestBid = Math.max(...asset.bids.map(bid => bid.amount));
            return Math.max(highestBid, asset.base_price || 0);
        }
        return asset.base_price || 0;
    }, [asset.bids, asset.base_price]);

    const handleBid = (e) => {
        e.preventDefault();
        const bidAmount = parseFloat(data.amount);
        
        if (bidAmount < minBid) {
            toast.error(`Your bid must be at least Ksh ${minBid.toLocaleString()} (${minBid === asset.base_price ? 'starting price' : 'current highest bid'})`);
            return;
        }

        post(route('buyer.bids.store', asset.id), {
            onSuccess: () => {
                reset();
                setShowBidSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            },
            onError: (errors) => {
                toast.error(errors.amount || 'Failed to place bid. Please try again.');
            },
        });
    };

    const toggleWatchlist = async () => {
        setIsToggling(true);
        try {
            const response = await axios.post(route('buyer.watchlist.toggle', asset.id));
            setIsWatching(response.data.isWatching);
            toast.success(response.data.isWatching ? 'Added to watchlist' : 'Removed from watchlist');
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            toast.error('Failed to update watchlist');
        } finally {
            setIsToggling(false);
        }
    };

    const timeLeft = new Date(asset.auction_end_time) - new Date();
    const hoursLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60)), 0);
    const canBid = auth.user && auth.user.id !== asset.user_id && hoursLeft > 0;
    const isOwner = auth.user && auth.user.id === asset.user_id;

    // Calculate current price based on bids and reserve price
    const currentPrice = React.useMemo(() => {
        if (!asset.bids || asset.bids.length === 0) {
            return asset.base_price || 0;
        }
        const highestBid = Math.max(...asset.bids.map(bid => bid.amount));
        return Math.max(highestBid, asset.base_price || 0);
    }, [asset.bids, asset.base_price]);

    return (
        <BuyerLayout>
            <Head title={asset.name} />

            {/* Bid Success Modal */}
            <AnimatePresence>
                {showBidSuccess && (
                    <Dialog
                        open={showBidSuccess}
                        onClose={() => setShowBidSuccess(false)}
                        className="relative z-50"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                            aria-hidden="true"
                        />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <Dialog.Panel
                                as={motion.div}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-2xl"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    >
                                        <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
                                    </motion.div>
                                    <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
                                        Bid Placed Successfully!
                                    </Dialog.Title>
                                    <p className="text-gray-600 mb-4">
                                        Your bid of Ksh {data.amount} has been placed. You will be notified if you are outbid.
                                    </p>
                                    <button
                                        onClick={() => setShowBidSuccess(false)}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-2xl"
                    >
                        <div className="p-8 text-gray-900">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Image Gallery */}
                                <div className="space-y-6">
                                    {photos.length > 0 ? (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                                className="relative rounded-xl overflow-hidden shadow-lg"
                                            >
                                                <img
                                                    src={`/storage/${photos[selectedImage]}`}
                                                    alt={asset.name}
                                                    className="w-full h-[500px] object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `/storage/assets/fallback/default.jpg`;
                                                    }}
                                                />
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={toggleWatchlist}
                                                    disabled={isToggling}
                                                    className={`absolute top-4 right-4 px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                                                        isWatching 
                                                            ? 'bg-blue-500 hover:bg-blue-600 text-white ring-2 ring-blue-300' 
                                                            : 'bg-white/90 hover:bg-white text-gray-600'
                                                    }`}
                                                    title={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
                                                >
                                                    {isToggling ? (
                                                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                                    ) : isWatching ? (
                                                        <>
                                                            <EyeSlashIcon className="w-5 h-5" />
                                                            <span className="text-sm font-medium">Watching</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeIcon className="w-5 h-5" />
                                                            <span className="text-sm font-medium">Watch</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </motion.div>
                                            {photos.length > 1 && (
                                                <div className="grid grid-cols-4 gap-3">
                                                    {photos.map((photo, index) => (
                                                        <motion.button
                                                            key={index}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedImage(index)}
                                                            className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                                                                selectedImage === index ? 'ring-2 ring-blue-500' : ''
                                                            }`}
                                                        >
                                                            <img
                                                                src={`/storage/${photo}`}
                                                                alt={`${asset.name} ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = `/storage/assets/fallback/default.jpg`;
                                                                }}
                                                            />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden shadow-lg">
                                            <img
                                                src={`/storage/assets/fallback/${asset.category?.toLowerCase() || 'default'}.jpg`}
                                                alt={asset.name}
                                                className="w-full h-[500px] object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `/storage/assets/fallback/default.jpg`;
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Asset Details */}
                                <div className="flex flex-col space-y-6">
                                <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{asset.name}</h1>
                                        <p className="text-gray-600 text-lg leading-relaxed">{asset.description}</p>
                                    </div>
                                    
                                    {/* Price and Info Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-gray-50 rounded-xl p-6 space-y-4"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <TagIcon className="h-5 w-5 text-gray-500" />
                                            <span className="text-gray-500">Category:</span>
                                            <span className="font-medium capitalize">{asset.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                                            <span className="text-gray-500">Current Price:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                Ksh {(currentPrice || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                                            <span className="text-gray-500">Starting Price:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                Ksh {(asset.base_price || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <CurrencyDollarIcon className="h-5 w-5 text-red-500" />
                                            <span className="text-gray-500">Reserve Price:</span>
                                            <span className="text-xl font-bold text-red-600">
                                                Ksh {(asset.reserve_price || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <ClockIcon className="h-5 w-5 text-red-500" />
                                            <span className="text-gray-500">Time Left:</span>
                                            <span className={`text-xl font-bold ${
                                                hoursLeft < 24 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {hoursLeft} hours
                                            </span>
                                </div>
                                    </motion.div>

                                    {/* Bid Form */}
                                    {canBid && (
                                        <motion.form
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            onSubmit={handleBid}
                                            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                                        >
                                            <h2 className="text-xl font-semibold mb-4">Place Your Bid</h2>
                                            <div className="space-y-4">
                                            <div>
                                                <InputLabel htmlFor="amount" value="Your Bid Amount" />
                                                <div className="mt-1 relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 sm:text-sm">Ksh</span>
                                                    </div>
                                                    <TextInput
                                                        id="amount"
                                                        type="number"
                                                        name="amount"
                                                        value={data.amount}
                                                        className="pl-12 block w-full rounded-lg"
                                                        min={currentPrice || asset.base_price || 0}
                                                        step="0.01"
                                                        onChange={(e) => setData('amount', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Minimum bid: Ksh {(currentPrice || asset.base_price || 0).toLocaleString()}
                                                </p>
                                                <InputError message={errors.amount} className="mt-2" />
                                            </div>

                                            <PrimaryButton 
                                                disabled={processing}
                                                    className="w-full py-3 text-lg"
                                            >
                                                {processing ? (
                                                    <span className="inline-flex items-center">
                                                            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                                        Placing Bid...
                                                    </span>
                                                ) : (
                                                    'Place Bid'
                                                )}
                                            </PrimaryButton>
                                            </div>
                                        </motion.form>
                                    )}

                                    {/* Bid History */}
                                    {asset.bids && asset.bids.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                                        >
                                            <div className="flex items-center space-x-2 mb-4">
                                                <UserGroupIcon className="h-5 w-5 text-gray-500" />
                                                <h2 className="text-xl font-semibold">Bid History</h2>
                                    </div>
                                    <div className="space-y-3">
                                                {asset.bids.map((bid, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                                    >
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {bid.user?.company_name || bid.user?.name || 'Anonymous Bidder'}
                                                                </span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                {format(new Date(bid.created_at), 'MMM d, yyyy h:mm a')}
                                                                    </span>
                                                        </div>
                                                        <span className="font-semibold text-blue-600">
                                                            Ksh {bid.amount.toLocaleString()}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                                        </div>
                                        </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </BuyerLayout>
    );
}