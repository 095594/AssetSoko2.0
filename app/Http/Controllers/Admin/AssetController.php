<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::paginate(6);
        return Inertia::render('Admin/Assets/Index', [
            'assets' => $assets,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Assets/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'quantity' => 'required|integer',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        Asset::create($request->all());
        return redirect()->route('admin.assets.index')->with('success', 'Asset created successfully.');
    }

    public function edit(Asset $asset)
    {
        return Inertia::render('Admin/Assets/Edit', [
            'asset' => $asset,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'quantity' => 'required|integer',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $asset->update($request->all());
        return redirect()->route('admin.assets.index')->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->route('admin.assets.index')->with('success', 'Asset deleted successfully.');
    }
}