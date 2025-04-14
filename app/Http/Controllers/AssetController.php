<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Auction;

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
            'category_id' => 'required|exists:categories,id',
            'condition' => 'required|in:new,used,refurbished',
            'start_price' => 'required|numeric|min:0',
            'reserve_price' => 'required|numeric|min:0|gte:start_price',
            'end_time' => 'required|date|after:now',
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'location' => 'required|string',
            'delivery_options' => 'required|array',
            'delivery_options.*' => 'in:pickup,delivery',
            'payment_methods' => 'required|array',
            'payment_methods.*' => 'in:mpesa,bank_transfer,cash',
        ]);

        try {
            DB::beginTransaction();

            $asset = new Asset($validated);
            $asset->user_id = auth()->id();
            $asset->current_price = $validated['start_price'];
            $asset->status = 'active';
            $asset->save();

            // Handle photos
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('assets/photos', 'public');
                $asset->photos()->create(['path' => $path]);
            }

            // Create auction
            $auction = new Auction([
                'start_time' => now(),
                'end_time' => $validated['end_time'],
                'status' => 'active'
            ]);
            $asset->auction()->save($auction);

            DB::commit();

            return redirect()->route('assets.show', $asset)
                ->with('success', 'Asset listed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create asset: ' . $e->getMessage());
        }
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'required|in:new,used,refurbished',
            'start_price' => 'required|numeric|min:0',
            'reserve_price' => 'required|numeric|min:0|gte:start_price',
            'end_time' => 'required|date|after:now',
            'photos' => 'sometimes|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'location' => 'required|string',
            'delivery_options' => 'required|array',
            'delivery_options.*' => 'in:pickup,delivery',
            'payment_methods' => 'required|array',
            'payment_methods.*' => 'in:mpesa,bank_transfer,cash',
        ]);

        try {
            DB::beginTransaction();

            // Update asset
            $asset->update($validated);

            // Handle new photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('assets/photos', 'public');
                    $asset->photos()->create(['path' => $path]);
                }
            }

            // Update auction
            $asset->auction->update([
                'end_time' => $validated['end_time']
            ]);

            // Check if auction should end
            if (now() >= $asset->auction->end_time) {
                $asset->status = 'ended';
                $asset->save();
            }

            DB::commit();

            return redirect()->route('assets.show', $asset)
                ->with('success', 'Asset updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update asset: ' . $e->getMessage());
        }
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
            'asset' => $asset,
            'auth' => [
                'user' => auth()->user()
            ]
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
            ->where('auction_end_time', '>', now())
            ->withCount('bids');

        // Search by name
        if ($request->has('name') && !empty($request->name)) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->name) . '%']);
        }

        // Apply category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Apply price filters
        if ($request->filled('min_price')) {
            $query->where('current_price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('current_price', '<=', $request->max_price);
        }

        // Apply sorting
        switch ($request->get('sort', 'newest')) {
            case 'price_low':
                $query->orderBy('current_price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('current_price', 'desc');
                break;
            case 'ending_soon':
                $query->orderBy('auction_end_time', 'asc');
                break;
            case 'most_bids':
                $query->orderBy('bids_count', 'desc');
                break;
            default:
                $query->latest();
        }

        $assets = $query->paginate(12);

        return Inertia::render('Buyer/BrowseAssets', [
            'assets' => $assets,
            'categories' => Asset::distinct()->pluck('category'),
            'darkMode' => $this->getDarkModePreference(),
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }
}