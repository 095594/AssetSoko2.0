<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $assets = Asset::where('user_id', auth()->id())
            ->with(['bids' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->paginate(10);

        return Inertia::render('Seller/Assets/Index', [
            'assets' => $assets
        ]);
    }

    public function create()
    {
        return Inertia::render('Seller/Assets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'reserve_price' => 'required|numeric|min:0|gte:base_price',
            'auction_end_time' => 'required|date|after:now',
            'condition' => 'required|in:new,used,refurbished',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $asset = new Asset($validated);
        $asset->user_id = auth()->id();
        $asset->status = 'active';
        $asset->current_price = $validated['base_price'];
        $asset->auction_start_time = now();

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

        return redirect()->route('seller.assets.index')
            ->with('success', 'Asset listed successfully.');
    }

    public function edit(Asset $asset)
    {
        if ($asset->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Seller/Assets/Edit', [
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
            'reserve_price' => 'required|numeric|min:0|gte:base_price',
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

        return redirect()->route('seller.assets.index')
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

        return redirect()->route('seller.assets.index')
            ->with('success', 'Asset deleted successfully.');
    }
} 