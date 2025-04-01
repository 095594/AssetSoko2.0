// ... existing code ...

const navigation = [
    { name: 'Dashboard', href: route('dashboard'), current: route().current('dashboard') },
    { name: 'My Assets', href: route('assets.index'), current: route().current('assets.*') },
    { name: 'Watchlist', href: route('watchlist.index'), current: route().current('watchlist.*') },
    { name: 'My Bids', href: route('bids.index'), current: route().current('bids.*') },
];

// ... rest of the code ...