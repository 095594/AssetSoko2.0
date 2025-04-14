import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AuctionWinnerModal from './AuctionWinnerModal';

const AuctionListener = ({ userId }) => {
    const [winnerModalData, setWinnerModalData] = useState(null);

    useEffect(() => {
        console.log('AuctionListener mounted for user:', userId);

        // Listen for auction ended events on private channel
        const channel = window.Echo.private(`user.${userId}`);
        
        console.log('Subscribing to channel:', `user.${userId}`);
        
        channel.listen('.AuctionEndedBroadcast', (event) => {
            console.log('Received auction event:', event);
            
            if (!event.type || !event.asset) {
                console.error('Invalid event data received:', event);
                return;
            }

            const { type, asset, winningBid } = event;
            
            switch (type) {
                case 'winner':
                    console.log('Showing winner modal for:', asset.name, 'with bid:', winningBid);
                    // Show winner modal
                    setWinnerModalData({ asset, winningBid });
                    // Show toast
                    toast.success(
                        `Congratulations! You won the auction for ${asset.name}!`,
                        {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                    break;

                case 'seller':
                    console.log('Showing seller notification for:', asset.name, 'with bid:', winningBid);
                    toast.info(
                        winningBid 
                            ? `Your asset ${asset.name} was sold for KES ${winningBid.amount}!`
                            : `Your auction for ${asset.name} ended with no bids`,
                        {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                    break;

                case 'outbid':
                    console.log('Showing outbid notification for:', asset.name, 'with bid:', winningBid);
                    toast.info(
                        winningBid
                            ? `The auction for ${asset.name} has ended. The winning bid was KES ${winningBid.amount}`
                            : `The auction for ${asset.name} has ended with no winner`,
                        {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                    break;

                default:
                    console.error('Unknown notification type:', type);
            }
        })
        .error((error) => {
            console.error('Error subscribing to channel:', error);
        });

        // Test connection
        channel.subscribed(() => {
            console.log('Successfully subscribed to channel:', `user.${userId}`);
        });

        // Cleanup on unmount
        return () => {
            console.log('AuctionListener unmounting, leaving channel:', `user.${userId}`);
            window.Echo.leave(`user.${userId}`);
        };
    }, [userId]);

    return (
        <>
            {winnerModalData && (
                <AuctionWinnerModal
                    isOpen={true}
                    asset={winnerModalData.asset}
                    winningBid={winnerModalData.winningBid}
                    onClose={() => setWinnerModalData(null)}
                />
            )}
        </>
    );
};

export default AuctionListener;