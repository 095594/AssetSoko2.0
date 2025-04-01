<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['publicIndex', 'show']);
    }

    public function index()
    {
        $assets = Asset::where('user_id', auth()->id())
            ->with(['bids' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->paginate(10);
    
        return Inertia::render('Assets/Index', [
            'assets' => $assets
        ]);
    }

    public function create()
    {
        return Inertia::render('Assets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'auction_end_time' => 'required|date|after:now',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $asset = new Asset($validated);
        $asset->user_id = auth()->id();

        if ($request->hasFile('photos')) {
            $photos = [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('assets', 'public');
                $photos[] = $path;
            }
            $asset->photos = json_encode($photos);
            $asset->image_url = $photos[0];
        }

        $asset->save();

        return redirect()->route('assets.index')
            ->with('success', 'Asset listed successfully.');
    }

    public function edit(Asset $asset)
    {
        if ($asset->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Assets/Edit', [
            'asset' => $asset
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        if ($asset->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'auction_end_time' => 'required|date|after:now',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('photos')) {
            // Delete old photos
            if ($asset->photos) {
                $oldPhotos = json_decode($asset->photos, true);
                foreach ($oldPhotos as $photo) {
                    Storage::disk('public')->delete($photo);
                }
            }

            // Store new photos
            $photos = [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('assets', 'public');
                $photos[] = $path;
            }
            $validated['photos'] = json_encode($photos);
            $validated['image_url'] = $photos[0];
        }

        $asset->update($validated);

        return redirect()->route('assets.index')
            ->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        if ($asset->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete photos
        if ($asset->photos) {
            $photos = json_decode($asset->photos, true);
            foreach ($photos as $photo) {
                Storage::disk('public')->delete($photo);
            }
        }

        $asset->delete();

        return redirect()->route('assets.index')
            ->with('success', 'Asset deleted successfully.');
    }

    public function show(Asset $asset)
    {
        $asset->load(['bids' => function ($query) {
            $query->with('user:id,name,company_name')->latest();
        }]);

        // Add watchlist status if user is authenticated
        if (auth()->check()) {
            $asset->is_watched = $asset->watchlist()->where('user_id', auth()->id())->exists();
        }

        return Inertia::render('Assets/Show', [
            'asset' => $asset
        ]);
    }

    /**
     * Display recent assets.
     */
    public function recent()
    {
        $recentAssets = Asset::with(['seller', 'bids'])
            ->where('auction_end_time', '>', now())
            ->orderBy('created_at', 'desc')
            ->take(12)
            ->get();
    
        return Inertia::render('Buyer/Assets/Recent', [
            'recentAssets' => $recentAssets,
            'darkMode' => $this->getDarkModePreference(),
        ]);
    }

    /**
     * Get the user's dark mode preference.
     */
    protected function getDarkModePreference()
    {
        return auth()->check() ? auth()->user()->dark_mode : false;
    }

    /**
     * Handle bid submission.
     */
    public function bid(Request $request, Asset $asset)
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:' . max($asset->current_price ?? $asset->base_price, $asset->base_price)]
        ]);
        
        // Create the bid
        $bid = $asset->bids()->create([
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'status' => 'pending',
        ]);
        
        // Update asset current price
        $asset->update([
            'current_price' => $request->amount,
            'bid_count' => $asset->bid_count + 1,
        ]);
        
        return back()->with('success', 'Bid placed successfully!');
    }

    /**
     * Display all available assets for public viewing.
     */
    public function publicIndex()
    {
        $assets = Asset::with(['user', 'bids'])
            ->where('status', 'active')
            ->where('auction_end_time', '>', now())
            ->latest()
            ->paginate(12);

        return Inertia::render('Assets/PublicIndex', [
            'assets' => $assets
        ]);
    }

    /**
     * Display all available assets for buyers to browse and bid on.
     */
    public function browse(Request $request)
    {
        $query = Asset::with(['bids', 'user' => function($query) {
            $query->select('id', 'name', 'company_name');
        }])
            ->where('status', 'active')
            ->where('auction_end_time', '>', now());

        // Apply filters if provided
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Add watchlist status if user is authenticated
        if (auth()->check()) {
            $query->with(['watchlist' => function ($query) {
                $query->where('user_id', auth()->id());
            }]);
        }

        $assets = $query->latest()->paginate(12);

        // Add is_watched property to each asset
        if (auth()->check()) {
            $assets->getCollection()->transform(function ($asset) {
                $asset->is_watched = $asset->watchlist->isNotEmpty();
                return $asset;
            });
        }

        return Inertia::render('Buyer/BrowseAssets', [
            'assets' => $assets,
            'filters' => $request->only(['category', 'min_price', 'max_price'])
        ]);
    }
}